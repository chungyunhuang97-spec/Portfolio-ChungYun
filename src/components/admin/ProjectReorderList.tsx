"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowUpRight, DotsSixVertical } from "@phosphor-icons/react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { reorderProjects } from "@/lib/admin-actions";
import type { Project } from "@/lib/types";

/**
 * One project card. Drafts are lime (they are what needs attention),
 * published are white, archived are muted. The whole card is the link; the
 * dotted handle on the left is the only drag target.
 */
export function ProjectCard({
  project,
  dragHandle,
}: {
  project: Project;
  dragHandle?: React.ReactNode;
}) {
  const tone =
    project.status === "draft"
      ? "bg-admin-lime text-admin-ink"
      : project.status === "archived"
        ? "bg-white/50 text-admin-text-muted"
        : "bg-white text-admin-text";
  const sub = project.status === "draft" ? "text-admin-ink/60" : "text-admin-text-faint";

  return (
    <div className={`admin-card relative flex min-h-[168px] flex-col overflow-hidden rounded-[26px] border border-white/70 ${tone}`}>
      <Link
        href={`/admin/projects/${project.slug}`}
        aria-label={`編輯 ${project.title}`}
        className="absolute inset-0 z-0 rounded-[26px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink"
      />
      <div className="pointer-events-none relative z-10 flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {project.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={project.cover_image_url} alt="" className="size-11 shrink-0 rounded-2xl object-cover" />
            ) : (
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-black/[0.06] font-mono text-xs text-admin-text-faint">
                {project.title.slice(0, 1)}
              </span>
            )}
            <StatusBadge status={project.status} />
          </div>
          <span className="admin-arrow flex size-9 shrink-0 items-center justify-center rounded-full bg-black/[0.07]">
            <ArrowUpRight size={15} weight="bold" />
          </span>
        </div>

        <div className="min-w-0">
          <h3 className="line-clamp-2 text-lg font-semibold leading-snug tracking-tight">{project.title}</h3>
          <p className={`mt-1 truncate text-xs ${sub}`}>
            {[project.category, project.timeframe].filter(Boolean).join(" · ") || `/work/${project.slug}`}
          </p>
        </div>

        <div className="mt-auto flex items-center gap-1.5">
          {!project.cover_image_url && (
            <span className="rounded-full bg-black/[0.07] px-2 py-0.5 text-[10px]">缺封面</span>
          )}
          {!project.is_visible && <span className="rounded-full bg-black/[0.07] px-2 py-0.5 text-[10px]">首頁隱藏</span>}
          {project.outcome && <span className="truncate rounded-full bg-black/[0.07] px-2 py-0.5 text-[10px]">{project.outcome}</span>}
        </div>
      </div>
      {dragHandle}
    </div>
  );
}

function SortableCard({ project }: { project: Project }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
    zIndex: isDragging ? 30 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ProjectCard
        project={project}
        dragHandle={
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`拖曳排序 ${project.title}`}
            className="absolute bottom-3 right-3 z-20 flex size-8 cursor-grab touch-none items-center justify-center rounded-full bg-black/[0.07] text-admin-text-muted hover:bg-admin-ink hover:text-white active:cursor-grabbing"
          >
            <DotsSixVertical size={15} weight="bold" />
          </button>
        }
      />
    </div>
  );
}

/**
 * Drag-to-reorder grid for one project_type group, persisting the new
 * `display_order` (= Bento `sort_order`) on drop. Only rendered when the
 * dashboard list isn't search/status-filtered -- reordering a filtered
 * subset would scramble the index math for the hidden projects.
 */
export function ProjectReorderList({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [items, setItems] = useState(projects);
  const [saving, setSaving] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((p) => p.id === active.id);
    const newIndex = items.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    setSaving(true);
    await reorderProjects(next.map((p, i) => ({ id: p.id, display_order: i + 1 })));
    setSaving(false);
    router.refresh();
  }

  if (items.length === 0) {
    return <p className="px-1 py-6 text-sm text-admin-text-faint">沒有符合的專案</p>;
  }

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((p) => p.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
            {items.map((p) => (
              <SortableCard key={p.id} project={p} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {saving && <p className="mt-2 text-[11px] text-admin-text-faint">儲存排序中…</p>}
    </div>
  );
}
