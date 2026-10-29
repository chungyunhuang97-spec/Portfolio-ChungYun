"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { DotsSixVertical, Star, Warning } from "@phosphor-icons/react";
import { cssAspectRatio, displayNumber } from "@/lib/about-video";
import { reorderVideoCategories, reorderVideos } from "@/lib/about-video-actions";
import type { Video, VideoCategoryWithVideos } from "@/lib/types";

/** Poster thumbnail, or a red "缺縮圖" block when there isn't one. */
export function VideoThumb({ video, className = "h-14" }: { video: Video; className?: string }) {
  const style = { aspectRatio: cssAspectRatio(video.aspect_ratio) };
  if (!video.poster_image) {
    return (
      <span
        style={style}
        className={`flex shrink-0 flex-col items-center justify-center gap-0.5 rounded border border-admin-danger bg-admin-danger-soft text-admin-danger ${className}`}
        title="缺少縮圖"
      >
        <Warning size={12} weight="bold" />
        <span className="text-[9px] font-semibold leading-none">缺縮圖</span>
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail of an uploaded/YouTube URL
    <img
      src={video.poster_image}
      alt={video.poster_alt ?? ""}
      style={style}
      className={`shrink-0 rounded border border-admin-border object-cover ${className}`}
    />
  );
}

function Pill({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "success" | "danger" }) {
  const tones = {
    muted: "bg-admin-border text-admin-text-muted",
    success: "bg-admin-success-soft text-admin-success",
    danger: "bg-admin-danger-soft text-admin-danger",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium tracking-[0.05em] ${tones[tone]}`}>
      {children}
    </span>
  );
}

function DragHandle(props: Record<string, unknown> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <button
      type="button"
      {...rest}
      aria-label={label}
      className="flex h-11 w-8 shrink-0 cursor-grab touch-none items-center justify-center text-admin-text-faint transition-colors hover:text-admin-text active:cursor-grabbing"
    >
      <DotsSixVertical size={16} weight="bold" />
    </button>
  );
}

function SortableVideoRow({ video, index }: { video: Video; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: video.id });
  const missingPoster = !video.poster_image;
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className={`flex items-center gap-1 bg-admin-surface ${missingPoster ? "border-l-2 border-admin-danger" : ""}`}
    >
      <DragHandle {...attributes} {...listeners} label={`拖曳排序 ${video.title}`} />
      <Link
        href={`/admin/videos/${video.id}`}
        className="flex min-w-0 flex-1 items-center gap-3 py-2 pr-4 transition-colors hover:bg-admin-surface-hover"
      >
        <span className="w-6 shrink-0 font-mono text-[11px] text-admin-text-faint">{displayNumber(index)}</span>
        <VideoThumb video={video} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 truncate text-sm text-admin-text">
            {video.is_featured && <Star size={12} weight="fill" className="shrink-0 text-admin-warning" aria-label="預設選取" />}
            {video.title}
          </span>
          <span className="mt-1 flex flex-wrap gap-1">
            <Pill>{video.source_type}</Pill>
            <Pill>{video.aspect_ratio}</Pill>
            {missingPoster && <Pill tone="danger">缺縮圖{video.source_type === "instagram" ? "（必填）" : ""}</Pill>}
          </span>
        </span>
        <Pill tone={video.is_visible ? "success" : "muted"}>{video.is_visible ? "可見" : "隱藏"}</Pill>
      </Link>
    </div>
  );
}

/** Drag-to-reorder list of one category's videos. */
export function SortableVideoList({ categoryId, videos }: { categoryId: string; videos: Video[] }) {
  const router = useRouter();
  const [items, setItems] = useState(videos);
  const [saving, setSaving] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  async function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const next = arrayMove(
      items,
      items.findIndex((v) => v.id === active.id),
      items.findIndex((v) => v.id === over.id)
    );
    setItems(next);
    setSaving(true);
    await reorderVideos(categoryId, next.map((v) => v.id));
    setSaving(false);
    router.refresh();
  }

  if (items.length === 0) return <p className="px-4 py-5 text-sm text-admin-text-faint">這個分類還沒有影片</p>;

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((v) => v.id)} strategy={verticalListSortingStrategy}>
          <div className="divide-y divide-admin-border">
            {items.map((v, i) => (
              <SortableVideoRow key={v.id} video={v} index={i} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {saving && <p className="px-4 py-1.5 text-[11px] text-admin-text-faint">儲存排序中…</p>}
    </div>
  );
}

function SortableCategory({ category, index }: { category: VideoCategoryWithVideos; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id });
  const missing = category.videos.filter((v) => !v.poster_image).length;
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="overflow-hidden rounded-lg border border-admin-border bg-admin-surface"
    >
      <div className="flex items-center gap-1 border-b border-admin-border bg-admin-surface-hover">
        <DragHandle {...attributes} {...listeners} label={`拖曳排序分類 ${category.title}`} />
        <Link
          href={`/admin/videos/categories/${category.id}`}
          className="flex min-w-0 flex-1 items-center justify-between gap-3 py-3 pr-4"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="font-mono text-xs text-admin-text-faint">{displayNumber(index)}</span>
            <span className="truncate text-sm font-medium text-admin-text">{category.title}</span>
            <span className="text-xs text-admin-text-faint">({category.videos.length})</span>
          </span>
          <span className="flex shrink-0 items-center gap-2">
            {missing > 0 && <Pill tone="danger">{missing} 支缺縮圖</Pill>}
            <Pill tone={category.is_visible ? "success" : "muted"}>{category.is_visible ? "可見" : "隱藏"}</Pill>
            <span className="text-xs text-admin-text-faint">編輯分類 →</span>
          </span>
        </Link>
      </div>
      <SortableVideoList categoryId={category.id} videos={category.videos} />
    </div>
  );
}

/** All categories (drag to reorder) with their videos grouped underneath. */
export function VideoCategoryBoard({ categories }: { categories: VideoCategoryWithVideos[] }) {
  const router = useRouter();
  const [items, setItems] = useState(categories);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  async function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const next = arrayMove(
      items,
      items.findIndex((c) => c.id === active.id),
      items.findIndex((c) => c.id === over.id)
    );
    setItems(next);
    await reorderVideoCategories(next.map((c) => c.id));
    router.refresh();
  }

  if (items.length === 0) return <p className="text-sm text-admin-text-faint">尚無分類</p>;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {items.map((c, i) => (
            <SortableCategory key={c.id} category={c} index={i} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
