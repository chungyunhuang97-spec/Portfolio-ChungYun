"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";
import {
  INLINE_EDIT_CHANNEL,
  isInlineEditMessage,
  type AdminToPreviewMessage,
  type Unsent,
  type InlineContent,
  type PreviewToAdminMessage,
} from "@/lib/inline-edit";
import { useChangesContext } from "@/components/admin/ChangesContext";

interface TargetHandlers {
  onEdit: (path: string, value: string) => void;
  onFocus?: (path: string) => void;
}

interface BridgeValue {
  register: (target: string, handlers: TargetHandlers) => () => void;
  publish: (target: string, content: InlineContent | null) => void;
}

const BridgeContext = createContext<BridgeValue | null>(null);

/**
 * Admin half of the inline-edit protocol (see `@/lib/inline-edit`).
 *
 * Forms register as a "target" and publish their current content; the
 * bridge forwards that to the preview iframe and routes the preview's
 * edits back to the right form. Content is cached per target so a reloaded
 * preview immediately gets every unsaved draft back.
 */
export function InlineEditBridgeProvider({
  iframeRef,
  children,
}: {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  children: ReactNode;
}) {
  const targets = useRef(new Map<string, TargetHandlers>());
  const latest = useRef(new Map<string, InlineContent | null>());
  const changes = useChangesContext();
  const saveAllRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    saveAllRef.current = changes && changes.dirtyEntries.length > 0 && !changes.savingAll ? () => void changes.saveAll() : null;
  });

  const send = useCallback(
    (message: Unsent<AdminToPreviewMessage>) => {
      const win = iframeRef.current?.contentWindow;
      if (!win) return;
      try {
        win.postMessage({ channel: INLINE_EDIT_CHANNEL, ...message }, window.location.origin);
      } catch {
        // The iframe may be mid-navigation; the next "ready" resyncs it.
      }
    },
    [iframeRef]
  );

  const syncAll = useCallback(() => {
    send({ type: "enable" });
    latest.current.forEach((content, target) => send({ type: "sync", target, content }));
  }, [send]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) return;
      if (!isInlineEditMessage(event.data)) return;
      const msg = event.data as PreviewToAdminMessage;

      if (msg.type === "ready") syncAll();
      else if (msg.type === "edit") targets.current.get(msg.target)?.onEdit(msg.path, msg.value);
      else if (msg.type === "focus") targets.current.get(msg.target)?.onFocus?.(msg.path);
      else if (msg.type === "save") saveAllRef.current?.();
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [iframeRef, syncAll]);

  // Also enable on every iframe load, in case "ready" fired before we listened.
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.addEventListener("load", syncAll);
    return () => iframe.removeEventListener("load", syncAll);
  });

  const value = useMemo<BridgeValue>(
    () => ({
      register(target, handlers) {
        targets.current.set(target, handlers);
        return () => {
          if (targets.current.get(target) === handlers) targets.current.delete(target);
        };
      },
      publish(target, content) {
        const prev = latest.current.get(target);
        if (prev !== undefined && JSON.stringify(prev) === JSON.stringify(content)) return;
        latest.current.set(target, content);
        send({ type: "sync", target, content });
      },
    }),
    [send]
  );

  return <BridgeContext.Provider value={value}>{children}</BridgeContext.Provider>;
}

/**
 * Lets a form take part in preview editing. Returns `publish` (call it
 * with the form's current content whenever it changes, or null to drop the
 * preview's drafts for this target). Safe outside the provider: it no-ops.
 */
export function useInlineEditTarget(target: string, handlers: TargetHandlers) {
  const bridge = useContext(BridgeContext);
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    if (!bridge) return;
    return bridge.register(target, {
      onEdit: (path, value) => handlersRef.current.onEdit(path, value),
      onFocus: (path) => handlersRef.current.onFocus?.(path),
    });
  }, [bridge, target]);

  return useCallback(
    (content: InlineContent | null) => {
      bridge?.publish(target, content);
    },
    [bridge, target]
  );
}

/** Scrolls an admin field into view, flashes it and focuses its input. */
export function revealField(target: HTMLElement | null | undefined) {
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  target.classList.remove("admin-flash");
  void target.offsetWidth; // restart the animation if it runs twice
  target.classList.add("admin-flash");
  window.setTimeout(() => target.classList.remove("admin-flash"), 1800);
}
