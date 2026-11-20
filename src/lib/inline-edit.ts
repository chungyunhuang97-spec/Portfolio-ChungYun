/**
 * Shared protocol for "edit text directly in the admin preview".
 *
 * The admin project page shows the real public page in a same-origin
 * iframe. Inside it, <Editable> turns marked text into contentEditable
 * spans once the admin parent says so; the two windows then talk through
 * postMessage:
 *
 *   preview -> admin   ready            the preview's editables are loaded
 *                      edit             the person typed in the preview
 *                      focus            the person clicked into a text
 *                      save             Cmd/Ctrl+S pressed inside the preview
 *   admin -> preview   enable           switch editing on
 *                      sync             one target's live form state, plus
 *                                       its saved content (what the page
 *                                       was rendered from)
 *
 * A "target" names one editor in the admin: a section_type ("hero",
 * "overview", ...) for project_sections rows, or "project" for the
 * project's own fields (subtitle, category, ...). A "path" is a dot path
 * into that editor's content, e.g. "title", "tagline.0", "items.2.desc".
 *
 * Nothing is saved from the preview itself: edits only flow into the admin
 * forms, and the admin's normal save buttons write them.
 */

export const INLINE_EDIT_CHANNEL = "pf-inline-edit";

export type InlineContent = Record<string, unknown>;

export type PreviewToAdminMessage =
  | { channel: typeof INLINE_EDIT_CHANNEL; type: "ready" }
  | { channel: typeof INLINE_EDIT_CHANNEL; type: "edit"; target: string; path: string; value: string }
  | { channel: typeof INLINE_EDIT_CHANNEL; type: "focus"; target: string; path: string }
  | { channel: typeof INLINE_EDIT_CHANNEL; type: "save" };

export type AdminToPreviewMessage =
  | { channel: typeof INLINE_EDIT_CHANNEL; type: "enable" }
  | {
      channel: typeof INLINE_EDIT_CHANNEL;
      type: "sync";
      target: string;
      content: InlineContent | null;
      saved?: InlineContent | null;
    };

/** A message as written by a sender, before the channel tag is added. */
export type Unsent<T> = T extends unknown ? Omit<T, "channel"> : never;

export function isInlineEditMessage(data: unknown): data is { channel: string; type: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as { channel?: unknown }).channel === INLINE_EDIT_CHANNEL &&
    typeof (data as { type?: unknown }).type === "string"
  );
}

function splitPath(path: string): string[] {
  return path.split(".").filter((p) => p !== "");
}

/** Reads a dot path out of nested objects/arrays; undefined if any step is missing. */
export function getIn(root: unknown, path: string): unknown {
  let cur: unknown = root;
  for (const key of splitPath(path)) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}

/**
 * Immutably writes `value` at a dot path, copying every container on the
 * way. Missing steps are created (an array when the next key is numeric,
 * otherwise an object), so a field that isn't in the content yet can still
 * be filled from the preview.
 */
export function setIn(root: unknown, path: string | string[], value: unknown): unknown {
  const keys = Array.isArray(path) ? path : splitPath(path);
  if (keys.length === 0) return value;
  const [head, ...rest] = keys;
  const isIndex = /^\d+$/.test(head);

  if (Array.isArray(root)) {
    const next = root.slice();
    const i = Number(head);
    next[i] = setIn(next[i], rest, value);
    return next;
  }
  if (root != null && typeof root === "object") {
    const obj = root as Record<string, unknown>;
    return { ...obj, [head]: setIn(obj[head], rest, value) };
  }
  if (isIndex) {
    const next: unknown[] = [];
    next[Number(head)] = setIn(undefined, rest, value);
    return next;
  }
  return { [head]: setIn(undefined, rest, value) };
}
