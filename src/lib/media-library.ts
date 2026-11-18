"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const BUCKET = "project-media";

export interface MediaItem {
  /** Path inside the bucket, e.g. "yangbei/process/frontend_video_url/1712.mp4". */
  path: string;
  url: string;
  size: number;
  createdAt: string | null;
  /** Where the file is referenced from (project slugs / page names). Empty = unused. */
  usedBy: string[];
}

type Client = Awaited<ReturnType<typeof createSupabaseServerClient>>;

/** Recursively lists every object in the bucket. */
async function listAll(supabase: Client, prefix = "", depth = 0): Promise<{ path: string; size: number; createdAt: string | null }[]> {
  if (depth > 8) return [];
  const { data, error } = await supabase.storage.from(BUCKET).list(prefix, { limit: 1000, sortBy: { column: "name", order: "asc" } });
  if (error || !data) return [];
  const files: { path: string; size: number; createdAt: string | null }[] = [];
  const folders: string[] = [];
  for (const entry of data) {
    const full = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.id === null) folders.push(full);
    else if (entry.name !== ".emptyFolderPlaceholder") {
      files.push({ path: full, size: Number(entry.metadata?.size ?? 0), createdAt: entry.created_at ?? null });
    }
  }
  const nested = await Promise.all(folders.map((f) => listAll(supabase, f, depth + 1)));
  return files.concat(...nested);
}

/** Serialized text of every table that can hold a media URL, keyed by a readable owner name. */
async function collectReferences(supabase: Client): Promise<{ owner: string; text: string }[]> {
  const refs: { owner: string; text: string }[] = [];

  const { data: projects } = await supabase.from("projects").select("*");
  const slugById = new Map<string, string>();
  for (const p of projects ?? []) {
    slugById.set(p.id, p.slug);
    refs.push({ owner: `專案：${p.title ?? p.slug}（封面／卡片）`, text: JSON.stringify(p) });
  }

  const { data: sections } = await supabase.from("project_sections").select("*");
  for (const s of sections ?? []) {
    refs.push({ owner: `專案：${slugById.get(s.project_id) ?? "?"}（${s.section_type}）`, text: JSON.stringify(s.content) });
  }

  for (const [table, owner] of [
    ["site_content", "首頁內容"],
    ["about_content", "關於我"],
    ["about_stats", "關於我"],
    ["about_tools", "關於我"],
    ["about_traits", "關於我"],
    ["videos", "影片作品"],
    ["video_categories", "影片作品"],
    ["video_works", "影片作品"],
    ["video_section_settings", "影片作品"],
    ["reel_links", "影片作品"],
    ["page_layouts", "版面編輯"],
  ] as const) {
    const { data } = await supabase.from(table).select("*");
    for (const row of data ?? []) refs.push({ owner, text: JSON.stringify(row) });
  }
  return refs;
}

function usageFor(path: string, refs: { owner: string; text: string }[]): string[] {
  const owners = new Set<string>();
  for (const r of refs) if (r.text.includes(path)) owners.add(r.owner);
  return [...owners];
}

export async function listMediaLibrary(): Promise<{ items: MediaItem[]; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { items: [], error: "尚未登入" };

  const [files, refs] = await Promise.all([listAll(supabase), collectReferences(supabase)]);
  const items = files.map((f) => ({
    ...f,
    url: supabase.storage.from(BUCKET).getPublicUrl(f.path).data.publicUrl,
    usedBy: usageFor(f.path, refs),
  }));
  items.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  return { items };
}

/** Deletes files -- but only ones that are still unreferenced when checked again here. */
export async function deleteUnusedMedia(paths: string[]): Promise<{ success: boolean; deleted: number; skipped: string[]; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, deleted: 0, skipped: [], error: "尚未登入" };

  const refs = await collectReferences(supabase);
  const safe = paths.filter((p) => usageFor(p, refs).length === 0);
  const skipped = paths.filter((p) => !safe.includes(p));
  if (safe.length === 0) return { success: true, deleted: 0, skipped };

  const { error } = await supabase.storage.from(BUCKET).remove(safe);
  if (error) return { success: false, deleted: 0, skipped, error: error.message };
  revalidatePath("/admin/media");
  return { success: true, deleted: safe.length, skipped };
}
