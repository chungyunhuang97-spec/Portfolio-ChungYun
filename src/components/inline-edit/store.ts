"use client";

import {
  INLINE_EDIT_CHANNEL,
  isInlineEditMessage,
  setIn,
  type AdminToPreviewMessage,
  type InlineContent,
  type PreviewToAdminMessage,
  type Unsent,
} from "@/lib/inline-edit";

/* Preview-side state for inline editing (see `@/lib/inline-edit`). */

export interface State {
  enabled: boolean;
  /** Latest (possibly unsaved) content per target, as the admin forms hold it. */
  overrides: Record<string, InlineContent | undefined>;
  /** Saved content per target -- what the server rendered into this page. */
  saved: Record<string, InlineContent | undefined>;
}

const SERVER_STATE: State = { enabled: false, overrides: {}, saved: {} };
let state: State = SERVER_STATE;
const listeners = new Set<() => void>();
let initialised = false;

export function setState(next: State) {
  state = next;
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const getState = () => state;
export const getServerState = () => SERVER_STATE;

export function post(message: Unsent<PreviewToAdminMessage>) {
  window.parent.postMessage({ channel: INLINE_EDIT_CHANNEL, ...message }, window.location.origin);
}

/** Records a value typed in the preview, so every copy of it follows along. */
export function setLocalValue(target: string, path: string, value: string) {
  setState({
    ...state,
    overrides: { ...state.overrides, [target]: setIn(state.overrides[target] ?? {}, path, value) as InlineContent },
  });
}

/**
 * True while the person is typing in `el`. activeElement alone isn't
 * enough: it stays set after they click over to the admin form, and the
 * form's edits must still reach this element then.
 */
export function isBeingEdited(el: Element) {
  return document.activeElement === el && document.hasFocus();
}

/** Shared key handling for every editable element in the preview. */
export function handleEditableKeyDown(e: KeyboardEvent, el: HTMLElement | null, multiline: boolean) {
  // Enter while an IME (e.g. Chinese/Japanese input) is composing picks a
  // candidate -- never treat it as "done".
  if (e.isComposing || e.keyCode === 229) return;
  if (e.key === "Escape" || (e.key === "Enter" && !multiline)) {
    e.preventDefault();
    el?.blur();
  }
}

const STYLE_ID = "pf-inline-edit-style";
const STYLE = `
[data-pf-editable] {
  outline: 1px dashed transparent;
  outline-offset: 3px;
  border-radius: 2px;
  cursor: text;
  transition: outline-color 120ms ease, background-color 120ms ease;
}
[data-pf-editable]:hover { outline-color: rgba(13, 153, 255, 0.7); }
[data-pf-editable]:focus {
  outline: 2px solid #0d99ff;
  background-color: rgba(13, 153, 255, 0.06);
}
[data-pf-editable]:empty::before {
  content: attr(data-placeholder);
  opacity: 0.35;
}
[data-pf-editable]:empty { display: inline-block; min-width: 2em; }
`;

/**
 * Wires the message listener once per page. Only ever does something when
 * the page sits inside a same-origin parent (the admin preview iframe);
 * on the public site this is a no-op.
 */
export function ensureInit() {
  if (initialised || typeof window === "undefined") return;
  initialised = true;
  if (window.parent === window) return;

  window.addEventListener("message", (event: MessageEvent) => {
    if (event.source !== window.parent || event.origin !== window.location.origin) return;
    if (!isInlineEditMessage(event.data)) return;
    const msg = event.data as AdminToPreviewMessage;

    if (msg.type === "enable") {
      if (state.enabled) return;
      if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = STYLE;
        document.head.appendChild(style);
      }
      setState({ ...state, enabled: true });
      // Loaded only once editing is on, so public visitors never fetch it.
      void import("./auto-link").then((m) => m.startAutoLink());
    } else if (msg.type === "sync") {
      setState({
        ...state,
        overrides: { ...state.overrides, [msg.target]: msg.content ?? undefined },
        saved: msg.saved === undefined ? state.saved : { ...state.saved, [msg.target]: msg.saved ?? undefined },
      });
    }
  });

  // Keyboard focus lives in the iframe while editing, so the admin's own
  // Cmd/Ctrl+S handler never sees it -- forward it instead of letting the
  // browser open "Save page as".
  window.addEventListener("keydown", (e) => {
    if (!state.enabled) return;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      post({ type: "save" });
    }
  });

  post({ type: "ready" });
}
