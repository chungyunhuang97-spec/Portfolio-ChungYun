import { PageSkeleton } from "@/components/admin/PageSkeleton";

// Own loading boundary per route segment: a boundary in a parent layout is not
// re-shown when only a param changes (e.g. project A -> project B), so the old
// page would stay on screen until the new data arrived.
export default function Loading() {
  return <PageSkeleton variant="editor" />;
}
