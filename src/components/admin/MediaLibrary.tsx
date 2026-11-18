"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Trash } from "@phosphor-icons/react";
import { deleteUnusedMedia, listMediaLibrary, type MediaItem } from "@/lib/media-library";
import { useAdminFeedback } from "@/components/admin/AdminFeedback";

type Filter = "all" | "unused" | "used";
type Sort = "new" | "size";

const isVideo = (p: string) => /\.(mp4|webm|mov|m4v)$/i.test(p);
const isImage = (p: string) => /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(p);

function formatBytes(b: number) {
  return b >= 1024 * 1024 ? `${(b / (1024 * 1024)).toFixed(1)}MB` : `${Math.max(1, Math.round(b / 1024))}KB`;
}

export function MediaLibrary() {
  const { confirm, toast } = useAdminFeedback();
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("new");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  async function load() {
    const result = await listMediaLibrary();
    if (result.error) setError(result.error);
    setItems(result.items);
  }

  useEffect(() => {
    let cancelled = false;
    listMediaLibrary().then((result) => {
      if (cancelled) return;
      if (result.error) setError(result.error);
      setItems(result.items);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = (items ?? []).filter((i) => {
      if (filter === "unused" && i.usedBy.length > 0) return false;
      if (filter === "used" && i.usedBy.length === 0) return false;
      return !q || i.path.toLowerCase().includes(q) || i.usedBy.some((u) => u.toLowerCase().includes(q));
    });
    return sort === "size" ? [...list].sort((a, b) => b.size - a.size) : list;
  }, [items, filter, sort, query]);

  const unused = (items ?? []).filter((i) => i.usedBy.length === 0);
  const unusedBytes = unused.reduce((n, i) => n + i.size, 0);
  const totalBytes = (items ?? []).reduce((n, i) => n + i.size, 0);

  function toggle(path: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  async function removeSelected() {
    const paths = [...selected];
    if (paths.length === 0) return;
    const ok = await confirm({
      title: `刪除 ${paths.length} 個未使用的檔案？`,
      message: "刪除後無法復原。系統會再次確認這些檔案真的沒有被任何頁面使用，仍在使用的會自動跳過。",
      confirmLabel: "刪除",
      danger: true,
    });
    if (!ok) return;
    setBusy(true);
    const result = await deleteUnusedMedia(paths);
    setBusy(false);
    if (!result.success) {
      toast(`刪除失敗：${result.error ?? "未知錯誤"}`, "error");
      return;
    }
    toast(
      `已刪除 ${result.deleted} 個檔案${result.skipped.length ? `，${result.skipped.length} 個仍在使用而跳過` : ""}`,
      "success"
    );
    setSelected(new Set());
    await load();
  }

  if (items === null) return <p className="py-10 text-sm text-admin-text-faint">載入媒體庫中…</p>;
  if (error) return <p className="py-10 text-sm text-admin-danger">{error}</p>;

  return (
    <div>
      <p className="text-sm text-admin-text-muted">
        共 {items.length} 個檔案、{formatBytes(totalBytes)}；其中 <span className="font-medium text-admin-text">{unused.length}</span> 個未被任何頁面使用（{formatBytes(unusedBytes)}）。
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜尋檔名、資料夾或使用位置…"
          className="w-full rounded-md border border-admin-border bg-admin-surface px-3 py-2 text-sm outline-none focus:border-admin-accent sm:max-w-xs"
        />
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              ["all", "全部"],
              ["unused", "未使用"],
              ["used", "使用中"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === id ? "bg-admin-text text-white" : "border border-admin-border bg-admin-surface text-admin-text-muted hover:border-admin-accent"
              }`}
            >
              {label}
            </button>
          ))}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-md border border-admin-border bg-admin-surface px-2 py-1.5 text-xs text-admin-text-muted"
          >
            <option value="new">最新上傳</option>
            <option value="size">檔案最大</option>
          </select>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="sticky top-14 z-10 mt-4 flex items-center justify-between gap-3 rounded-md border border-admin-danger/30 bg-admin-danger-soft px-4 py-2.5">
          <span className="text-sm text-admin-text">已選 {selected.size} 個</span>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setSelected(new Set())} className="text-xs text-admin-text-muted hover:underline">
              取消選取
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={removeSelected}
              className="inline-flex items-center gap-1 rounded-md bg-admin-danger px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              <Trash size={12} weight="bold" />
              {busy ? "刪除中…" : "刪除"}
            </button>
          </div>
        </div>
      )}

      <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => {
          const isUnused = item.usedBy.length === 0;
          return (
            <li key={item.path} className="flex gap-3 rounded-lg border border-admin-border bg-admin-surface p-3">
              <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-md border border-admin-border bg-admin-surface-hover">
                {isVideo(item.path) ? (
                  <video src={item.url} muted preload="metadata" className="h-full w-full object-cover" />
                ) : isImage(item.path) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center font-mono text-[10px] uppercase text-admin-text-faint">
                    {item.path.split(".").pop()}
                  </span>
                )}
                {isUnused && (
                  <input
                    type="checkbox"
                    checked={selected.has(item.path)}
                    onChange={() => toggle(item.path)}
                    aria-label={`選取 ${item.path}`}
                    className="absolute left-1 top-1 size-4 accent-admin-danger"
                  />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="truncate font-mono text-[11px] text-admin-text" title={item.path}>
                  {item.path.split("/").pop()}
                </p>
                <p className="truncate text-[10px] text-admin-text-faint" title={item.path}>
                  {item.path.split("/").slice(0, -1).join(" / ")}
                </p>
                <p className="text-[11px] text-admin-text-faint">
                  {formatBytes(item.size)}
                  {item.createdAt ? ` · ${new Date(item.createdAt).toLocaleDateString("zh-TW")}` : ""}
                </p>
                {isUnused ? (
                  <span className="w-fit rounded-full bg-admin-warning-soft px-2 py-0.5 text-[10px] font-medium text-admin-warning">未使用</span>
                ) : (
                  <p className="line-clamp-2 text-[11px] text-admin-text-muted">用於：{item.usedBy.join("、")}</p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(item.url).then(
                      () => toast("已複製網址", "success"),
                      () => toast("複製失敗", "error")
                    );
                  }}
                  className="mt-auto inline-flex w-fit items-center gap-1 text-[11px] text-admin-accent hover:underline"
                >
                  <Copy size={11} weight="bold" />
                  複製網址
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {visible.length === 0 && <p className="py-10 text-center text-sm text-admin-text-faint">沒有符合的檔案</p>}
    </div>
  );
}
