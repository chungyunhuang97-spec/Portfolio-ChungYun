"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

interface ChangeEntry {
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
 */
class ChangesStore {
  private entries = new Map<string, ChangeEntry>();
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

  register = (id: string, entry: ChangeEntry) => {
    const prev = this.entries.get(id);
    this.entries.set(id, entry);
    // Only bump the version (and notify) when the dirty flag actually
    // flips, or this is a brand-new registration -- keeps every keystroke
    // in a field from re-rendering the sticky bar while `save` (read
    // straight off the map, not the snapshot) always stays fresh.
    if (!prev || prev.isDirty !== entry.isDirty) {
      this.version++;
      this.listeners.forEach((l) => l());
    }
  };

  unregister = (id: string) => {
    if (this.entries.delete(id)) {
      this.version++;
      this.listeners.forEach((l) => l());
    }
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

interface ChangesContextValue {
  register: (id: string, entry: ChangeEntry) => void;
  unregister: (id: string) => void;
  dirtyEntries: DirtyEntry[];
  saveAll: () => Promise<void>;
  savingAll: boolean;
}

const ChangesContext = createContext<ChangesContextValue | null>(null);

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

  const value = useMemo(
    () => ({ register: store.register, unregister: store.unregister, dirtyEntries, saveAll, savingAll }),
    [store, dirtyEntries, saveAll, savingAll]
  );

  return <ChangesContext.Provider value={value}>{children}</ChangesContext.Provider>;
}

/**
 * Call from any editor that wants to participate in the sticky changes
 * bar. Safe to call even outside a ChangesProvider (e.g. the standalone
 * site-content editor) -- it just no-ops and the editor's own Save button
 * keeps working exactly as before.
 */
export function useTrackChanges(id: string, label: string, isDirty: boolean, save: () => Promise<void>) {
  const ctx = useContext(ChangesContext);
  useEffect(() => {
    if (!ctx) return;
    ctx.register(id, { label, isDirty, save });
    return () => ctx.unregister(id);
  }, [ctx, id, label, isDirty, save]);
}

export function useChangesContext() {
  return useContext(ChangesContext);
}
