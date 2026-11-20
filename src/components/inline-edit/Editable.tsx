"use client";

import { useEffect, useLayoutEffect, useRef, useSyncExternalStore, type ElementType } from "react";
import { getIn } from "@/lib/inline-edit";
import {
  ensureInit,
  getServerState,
  getState,
  handleEditableKeyDown,
  isBeingEdited,
  post,
  setLocalValue,
  subscribe,
} from "@/components/inline-edit/store";

/* -------------------------------------------------------------------------- */
/* <Editable>                                                                   */
/*                                                                              */
/* Most CMS text is made editable automatically (see ./auto-link). Use this    */
/* explicit wrapper where that can't work: text that may be empty, text whose  */
/* saved value isn't rendered verbatim, or to pin the exact field to edit.     */
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
  const textRef = useRef(text);
  const syncDom = () => {
    const el = ref.current;
    if (el && el.textContent !== textRef.current) el.textContent = textRef.current;
  };
  useLayoutEffect(() => {
    textRef.current = text;
    if (ref.current && !isBeingEdited(ref.current)) syncDom();
  }, [text]);
  // Catch up on form edits made while this element still held focus.
  useEffect(() => {
    window.addEventListener("blur", syncDom);
    return () => window.removeEventListener("blur", syncDom);
  });

  function handleInput() {
    const el = ref.current;
    if (!el) return;
    const value = el.textContent ?? "";
    // Update locally first so other copies of the same text (the mobile and
    // desktop layouts render it twice) follow along immediately.
    setLocalValue(target, path, value);
    post({ type: "edit", target, path, value });
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
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => handleEditableKeyDown(e.nativeEvent, ref.current, Boolean(multiline))}
      onFocus={() => post({ type: "focus", target, path })}
      onBlur={syncDom}
      // Links/cards around the text shouldn't navigate while editing.
      onClick={(e: React.MouseEvent) => e.preventDefault()}
    />
  );
}
