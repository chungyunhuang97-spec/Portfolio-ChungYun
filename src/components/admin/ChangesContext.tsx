"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

interface StoreEntry {
  label: string;
  isDirty: boolean;
  save: () => Promise<void>;
}

interface DirtyEntry {
  id: string;
  label: string;
}

/**
 * Plain external store (not React state) holding every registered editor's
 * dirty/save status. Read via useSyncExternalStore -- the React-sanctioned
 * way to read mutable external state during render without touching a ref
 * in the render body.
 *
 * Registration identity (register/unregister) is kept deliberately separate
 * from status updates (setDirty): a component's "save" closure is a new
 * function on every render, and an earlier version of this store re-ran
 * register/unregister on every one of those renders -- which notified
 * subscribers, which re-rendered every consumer of the context, which
 * produced a new closure again, forever (React error #185, "Maximum update
 * depth exceeded"). setDirty only touches the store -- and only notifies --
 * when the boolean actually flips, so it can safely be driven by a
 * primitive dependency instead of a function reference.
 */
class ChangesStore {
  private entries = new Map<string, StoreEntry>();
  private listeners = new Set<() => void>();
  private cachedSnapshot: DirtyEntry[] = [];
  private version = 0;
  private cachedVersion = -1;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): DirtyEntry[] => {
    if (this.cachedVersion !== this.version) {
      this.cachedSnapshot = Array.from(this.entries.entries())
        .filter(([, entry]) => entry.isDirty)
        .map(([id, entry]) => ({ id, label: entry.label }));
      this.cachedVersion = this.version;
    }
    return this.cachedSnapshot;
  };

  private notify() {
    this.version++;
    this.listeners.forEach((l) => l());
  }

  /** Registers (or re-registers) an editor's identity. Does NOT notify --
   *  a fresh registration preserves whatever isDirty was already on record
   *  (or starts false), so it never changes the dirty snapshot by itself.
   *  Safe to call every time `save`'s closure changes. */
  register = (id: string, label: string, save: () => Promise<void>) => {
    const prev = this.entries.get(id);
    this.entries.set(id, { label, save, isDirty: prev?.isDirty ?? false });
  };

  unregister = (id: string) => {
    const existed = this.entries.get(id);
    this.entries.delete(id);
    if (existed?.isDirty) this.notify();
  };

  /** The only place that notifies for a dirty-flag change -- driven by a
   *  primitive boolean dependency, never by function identity. */
  setDirty = (id: string, isDirty: boolean) => {
    const entry = this.entries.get(id);
    if (!entry || entry.isDirty === isDirty) return;
    entry.isDirty = isDirty;
    this.notify();
  };

  saveAll = async () => {
    const dirty = Array.from(this.entries.values()).filter((e) => e.isDirty);
    // Sequential, not Promise.all: these are Supabase writes to different
    // rows, but sequential keeps the sticky bar's progress legible and
    // avoids a burst of concurrent server actions when 8+ sections are open.
    for (const entry of dirty) {
      await entry.save();
    }
  };
}

interface ActionsContextValue {
  register: (id: string, label: string, save: () => Promise<void>) => void;
  unregister: (id: string) => void;
  setDirty: (id: string, isDirty: boolean) => void;
  saveAll: () => Promise<void>;
}

interface StatusContextValue {
  dirtyEntries: DirtyEntry[];
  savingAll: boolean;
}

// Split into two contexts on purpose: ActionsContext's value is 100% stable
// for the lifetime of the provider (register/unregister/setDirty are bound
// store methods, saveAll is a useCallback with stable deps) -- it never
// changes identity, no matter how often dirty status changes elsewhere on
// the page. StatusContext is the one that changes when dirtyEntries does.
// useTrackChanges only ever reads ActionsContext, so one editor's dirty
// flag flipping can never cause every OTHER editor's registration effect
// to re-fire. That churn was the actual cause of the infinite loop: with
// everything in a single context, any dirty-status change produced a new
// context value, which every consumer's effect depended on, which re-ran
// register/unregister, which (for an already-dirty entry) notified again.
const ActionsContext = createContext<ActionsContextValue | null>(null);
const StatusContext = createContext<StatusContextValue | null>(null);

/**
 * Wraps a page (or part of one) that contains multiple independent editors
 * -- e.g. every section's ContentEditor plus the ProjectMetaForm on a
 * single project edit page. Each editor keeps its own local state and its
 * own "Save" button (nothing here takes that away), but each also reports
 * its dirty status here so a single sticky bar can show "3 sections have
 * unsaved changes" and save all of them in one action, instead of the
 * person having to scroll and hunt for every button they touched.
 */
export function ChangesProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => new ChangesStore());
  const [savingAll, setSavingAll] = useState(false);

  const dirtyEntries = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  const saveAll = useCallback(async () => {
    setSavingAll(true);
    try {
      await store.saveAll();
    } finally {
      setSavingAll(false);
    }
  }, [store]);

  const actions = useMemo(
    () => ({
      register: store.register,
      unregister: store.unregister,
      setDirty: store.setDirty,
      saveAll,
    }),
    [store, saveAll]
  );

  const status = useMemo(() => ({ dirtyEntries, savingAll }), [dirtyEntries, savingAll]);

  return (
    <ActionsContext.Provider value={actions}>
      <StatusContext.Provider value={status}>{children}</StatusContext.Provider>
    </ActionsContext.Provider>
  );
}

/**
 * Call from any editor that wants to participate in the sticky changes
 * bar. Safe to call even outside a ChangesProvider (e.g. the standalone
 * site-content editor) -- it just no-ops and the editor's own Save button
 * keeps working exactly as before.
 *
 * `save` deliberately does NOT appear in any effect's dependency array --
 * it's a new closure every render, so depending on it would re-run
 * registration every render. Instead it's kept in a ref that's refreshed
 * after every render, and the registered entry calls through the ref.
 */
export function useTrackChanges(id: string, label: string, isDirty: boolean, save: () => Promise<void>) {
  const ctx = useContext(ActionsContext);
  const saveRef = useRef(save);

  useEffect(() => {
    saveRef.current = save;
  });

  useEffect(() => {
    if (!ctx) return;
    ctx.register(id, label, () => saveRef.current());
    return () => ctx.unregister(id);
  }, [ctx, id, label]);

  useEffect(() => {
    if (!ctx) return;
    ctx.setDirty(id, isDirty);
  }, [ctx, id, isDirty]);
}

/** For UI that needs to both read status (dirtyEntries/savingAll) and
 *  trigger saveAll -- e.g. StickyChangesBar. Combining both contexts here
 *  is fine because this hook's return value is only used for rendering,
 *  never fed back into another hook's dependency array. */
export function useChangesContext() {
  const actions = useContext(ActionsContext);
  const status = useContext(StatusContext);
  if (!actions || !status) return null;
  return { ...actions, ...status };
}
