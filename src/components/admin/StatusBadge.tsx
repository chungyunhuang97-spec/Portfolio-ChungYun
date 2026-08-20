import type { ProjectStatus } from "@/lib/types";

const STATUS_STYLES: Record<ProjectStatus, string> = {
  published: "bg-admin-success-soft text-admin-success",
  draft: "bg-admin-warning-soft text-admin-warning",
  archived: "bg-admin-border text-admin-text-faint",
};

const STATUS_LABELS: Record<ProjectStatus, string> = {
  published: "PUBLISHED",
  draft: "DRAFT",
  archived: "ARCHIVED",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium tracking-[0.1em] ${STATUS_STYLES[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status]}
    </span>
  );
}

/** Small "X/Y filled in" indicator, e.g. for media-field completion on a section. */
export function CompletionBadge({ filled, total }: { filled: number; total: number }) {
  if (total === 0) return null;
  const complete = filled === total;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium tracking-[0.1em] ${
        complete ? "bg-admin-success-soft text-admin-success" : "bg-admin-border text-admin-text-muted"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {filled}/{total}
    </span>
  );
}
