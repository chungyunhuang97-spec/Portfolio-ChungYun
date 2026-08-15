// Split out from edit-mode-actions.ts: a "use server" file may only export
// async functions, so this plain string constant has to live in its own
// module to be importable from both server components and client components.
export const EDIT_MODE_COOKIE = "editor-mode";
