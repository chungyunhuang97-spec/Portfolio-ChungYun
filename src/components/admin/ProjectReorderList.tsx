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
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DotsSixVertical } from "@phosphor-icons/react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { reorderProjects } from "@/lib/admin-actions";
import type { Project } from "@/lib/types";

function SortableRow({ project }: { project: Project }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-1 bg-admin-surface">
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`拖曳排序 ${project.title}`}
        className="flex h-11 w-8 shrink-0 cursor-grab touch-none items-center justify-center text-admin-text-faint transition-colors hover:text-admin-text active:cursor-grabbing"
      >
        <DotsSixVertical size={16} weight="bold" />
      </button>
      <Link
        href={`/admin/projects/${project.slug}`}
        className="flex flex-1 items-center justify-between gap-3 py-3 pr-4 transition-colors hover:bg-admin-surface-hover"
      >
        <span className="truncate text-sm text-admin-text">{project.title}</span>
        <div className="flex shrink-0 items-center gap-3">
          <StatusBadge status={project.status} />
          <span className="text-xs text-admin-text-faint">Edit →</span>
        </div>
      </Link>
    </div>
  );
}

/**
 * Drag-to-reorder list for one project_type group (case studies or side
 * projects), persisting the new `display_order` (= Bento `sort_order`) on
 * drop. Only rendered when the dashboard list isn't search/status-filtered
 * -- reordering a filtered subset would scramble the index math for the
 * projects hidden by the filter, so AdminDashboardOverview falls back to
 * the plain read-only list in that case.
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
    return <p className="px-4 py-6 text-sm text-admin-text-faint">沒有符合的專案</p>;
  }

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <div className="divide-y divide-admin-border overflow-hidden rounded-lg border border-admin-border bg-admin-surface">
            {items.map((p) => (
              <SortableRow key={p.id} project={p} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {saving && <p className="mt-1.5 text-[11px] text-admin-text-faint">儲存排序中…</p>}
    </div>
  );
}
