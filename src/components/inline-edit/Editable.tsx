"use client";

import { useEffect, useLayoutEffect, useRef, useSyncExternalStore, type ElementType } from "react";
import {
  INLINE_EDIT_CHANNEL,
  getIn,
  isInlineEditMessage,
  setIn,
  type AdminToPreviewMessage,
  type InlineContent,
  type PreviewToAdminMessage,
  type Unsent,
} from "@/lib/inline-edit";

/* -------------------------------------------------------------------------- */
/* Preview-side store                                                          */
/* -------------------------------------------------------------------------- */

interface State {
  enabled: boolean;
  /** Latest content per target, as pushed by the admin forms (or typed here). */
  overrides: Record<string, InlineContent | undefined>;
}

const SERVER_STATE: State = { enabled: false, overrides: {} };
let state: State = SERVER_STATE;
const listeners = new Set<() => void>();
let initialised = false;

function setState(next: State) {
  state = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getState = () => state;
const getServerState = () => SERVER_STATE;

function post(message: Unsent<PreviewToAdminMessage>) {
  window.parent.postMessage({ channel: INLINE_EDIT_CHANNEL, ...message }, window.location.origin);
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
function ensureInit() {
  if (initialised || typeof window === "undefined") return;
  initialised = true;
  if (window.parent === window) return;

  window.addEventListener("message", (event: MessageEvent) => {
    if (event.source !== window.parent || event.origin !== window.location.origin) return;
    if (!isInlineEditMessage(event.data)) return;
    const msg = event.data as AdminToPreviewMessage;

    if (msg.type === "enable") {
      if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = STYLE;
        document.head.appendChild(style);
      }
      if (!state.enabled) setState({ ...state, enabled: true });
    } else if (msg.type === "sync") {
      setState({ ...state, overrides: { ...state.overrides, [msg.target]: msg.content ?? undefined } });
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

/* -------------------------------------------------------------------------- */
/* <Editable>                                                                   */
/* -------------------------------------------------------------------------- */

interface EditableProps {
  /** Admin editor that owns this text: a section_type, or "project". */
  target: string;
  /** Dot path inside that editor's content, e.g. "title" or "items.0.desc". */
  path: string;
  /** The server-rendered value. */
  value: string | null | undefined;
  /** Allow Enter to insert a line break (only useful if the CSS shows them). */
  multiline?: boolean;
  /** Shown faintly while the text is empty, so it stays clickable. */
  placeholder?: string;
  /** Wrapper element in edit mode. */
  as?: ElementType;
  className?: string;
}

/**
 * Marks a piece of CMS text as editable from the admin preview.
 *
 * On the public site (and until the admin says "enable") it renders the
 * bare text with no wrapper, so markup and layout are untouched. In the
 * admin preview it becomes a plaintext contentEditable span whose edits
 * are sent to the matching admin form.
 */
export function Editable({ target, path, value, multiline, placeholder = "輸入文字", as = "span", className }: EditableProps) {
  const current = useSyncExternalStore(subscribe, getState, getServerState);

  useEffect(() => {
    ensureInit();
  }, []);

  if (!current.enabled) return <>{value ?? ""}</>;

  // A field the form has cleared comes through as null: show it empty (the
  // placeholder keeps it clickable) rather than the stale saved text.
  const override = getIn(current.overrides[target], path);
  const text = typeof override === "string" ? override : override === null ? "" : (value ?? "");

  return (
    <EditableText
      target={target}
      path={path}
      text={text}
      multiline={multiline}
      placeholder={placeholder}
      as={as}
      className={className}
    />
  );
}

function EditableText({
  target,
  path,
  text,
  multiline,
  placeholder,
  as: Tag,
  className,
}: {
  target: string;
  path: string;
  text: string;
  multiline?: boolean;
  placeholder: string;
  as: ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  // The DOM is the source of truth while typing; React never renders the
  // text as children (that would fight the caret). Outside updates are
  // copied in only when this element isn't being edited.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || document.activeElement === el) return;
    if (el.textContent !== text) el.textContent = text;
  }, [text]);

  function handleInput() {
    const el = ref.current;
    if (!el) return;
    const value = el.textContent ?? "";
    // Update locally first so other copies of the same text (the mobile and
    // desktop layouts render it twice) follow along immediately.
    setState({
      ...state,
      overrides: { ...state.overrides, [target]: setIn(state.overrides[target] ?? {}, path, value) as InlineContent },
    });
    post({ type: "edit", target, path, value });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    // Enter while an IME (e.g. Chinese/Japanese input) is composing picks a
    // candidate -- never treat it as "done".
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === "Escape" || (e.key === "Enter" && !multiline)) {
      e.preventDefault();
      ref.current?.blur();
    }
  }

  return (
    <Tag
      ref={ref}
      className={className}
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      spellCheck={false}
      data-pf-editable=""
      data-placeholder={placeholder}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onFocus={() => post({ type: "focus", target, path })}
      // Links/cards around the text shouldn't navigate while editing.
      onClick={(e: React.MouseEvent) => e.preventDefault()}
    />
  );
}
