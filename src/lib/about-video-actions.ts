"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  validateAboutContent,
  validateAboutStats,
  validateAboutTraits,
  validateVideo,
  type VideoFields,
} from "@/lib/about-video";
import type { AboutContent, AboutIcon, VideoCategory, VideoSourceType } from "@/lib/types";

type Result = { success: true } | { success: false; error: string };
type CreateResult = { success: true; id: string } | { success: false; error: string };

function fail(error: string): { success: false; error: string } {
  return { success: false, error };
}

/* ------------------------------------------------------------------ */
/* About                                                               */
/* ------------------------------------------------------------------ */

function revalidateAbout() {
  revalidatePath("/");
  revalidatePath("/admin/about");
}

export type AboutContentFields = Omit<AboutContent, "id" | "updated_at">;

export async function updateAboutContent(fields: AboutContentFields): Promise<Result> {
  const { errors } = validateAboutContent(fields);
  if (errors.length > 0) return fail(errors.join("；"));

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("about_content")
    .upsert({ id: true, ...fields, updated_at: new Date().toISOString() });
  if (error) return fail(error.message);
  revalidateAbout();
  return { success: true };
}

type ListTable = "about_traits" | "about_stats" | "about_tools";

/**
 * Saves a whole ordered list in one go: rows without an id are inserted,
 * rows missing from `rows` are deleted, and sort_order follows array order.
 */
async function saveOrderedList<T extends { id?: string }>(table: ListTable, rows: T[]): Promise<Result> {
  const supabase = await createSupabaseServerClient();
  const { data: existing, error: loadError } = await supabase.from(table).select("id");
  if (loadError) return fail(loadError.message);

  const keep = new Set(rows.map((r) => r.id).filter(Boolean));
  const toDelete = (existing ?? []).map((r) => r.id as string).filter((id) => !keep.has(id));
  if (toDelete.length > 0) {
    const { error } = await supabase.from(table).delete().in("id", toDelete);
    if (error) return fail(error.message);
  }

  for (const [i, row] of rows.entries()) {
    const { id, ...rest } = row;
    const payload = { ...rest, sort_order: i + 1 };
    const { error } = id
      ? await supabase.from(table).update(payload).eq("id", id)
      : await supabase.from(table).insert(payload);
    if (error) return fail(error.message);
  }

  revalidateAbout();
  return { success: true };
}

export async function saveAboutTraits(
  traits: { id?: string; title: string; description: string; icon: AboutIcon }[]
): Promise<Result> {
  const { errors } = validateAboutTraits(traits);
  if (errors.length > 0) return fail(errors.join("；"));
  return saveOrderedList("about_traits", traits);
}

export async function saveAboutStats(
  stats: { id?: string; value: number; suffix: string | null; label: string }[]
): Promise<Result> {
  const { errors } = validateAboutStats(stats);
  if (errors.length > 0) return fail(errors.join("；"));
  return saveOrderedList("about_stats", stats);
}

export async function saveAboutTools(tools: { id?: string; name: string }[]): Promise<Result> {
  const cleaned = tools.map((t) => ({ ...t, name: t.name.trim() })).filter((t) => t.name);
  return saveOrderedList("about_tools", cleaned);
}

/* ------------------------------------------------------------------ */
/* Video categories                                                    */
/* ------------------------------------------------------------------ */

function revalidateVideos(categoryId?: string, videoId?: string) {
  revalidatePath("/");
  revalidatePath("/admin/videos");
  if (categoryId) revalidatePath(`/admin/videos/categories/${categoryId}`);
  if (videoId) revalidatePath(`/admin/videos/${videoId}`);
}

export async function createVideoCategory(title: string): Promise<CreateResult> {
  if (!title.trim()) return fail("分類名稱為必填");
  const supabase = await createSupabaseServerClient();
  const { data: last } = await supabase
    .from("video_categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle<{ sort_order: number }>();
  const { data, error } = await supabase
    .from("video_categories")
    .insert({ title: title.trim(), sort_order: (last?.sort_order ?? 0) + 1 })
    .select("id")
    .single<{ id: string }>();
  if (error || !data) return fail(error?.message ?? "建立失敗");
  revalidateVideos();
  return { success: true, id: data.id };
}

export type VideoCategoryFields = Pick<
  VideoCategory,
  "title" | "subtitle" | "description" | "is_visible" | "level_label" | "brief_image_url" | "tags" | "profile_url"
>;

export async function updateVideoCategory(id: string, fields: VideoCategoryFields): Promise<Result> {
  if (!fields.title.trim()) return fail("分類名稱為必填");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("video_categories")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return fail(error.message);
  revalidateVideos(id);
  return { success: true };
}

/** Deletes the category and (via ON DELETE CASCADE) all its videos. */
export async function deleteVideoCategory(id: string): Promise<Result> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("video_categories").delete().eq("id", id);
  if (error) return fail(error.message);
  revalidateVideos();
  return { success: true };
}

export async function reorderVideoCategories(ids: string[]): Promise<Result> {
  const supabase = await createSupabaseServerClient();
  for (const [i, id] of ids.entries()) {
    const { error } = await supabase.from("video_categories").update({ sort_order: i + 1 }).eq("id", id);
    if (error) return fail(error.message);
  }
  revalidateVideos();
  return { success: true };
}

/* ------------------------------------------------------------------ */
/* Videos                                                              */
/* ------------------------------------------------------------------ */

/** New videos start hidden, so an Instagram one can't go live before its
 * poster is uploaded. `source` is the pasted URL, or for mp4 the URL of
 * the file already uploaded by the create form. */
export async function createVideo(
  categoryId: string,
  title: string,
  sourceType: VideoSourceType,
  source: string
): Promise<CreateResult> {
  if (!title.trim()) return fail("標題為必填");
  if (!source.trim()) return fail(sourceType === "mp4" ? "請上傳影片檔" : "請填入影片網址");
  const supabase = await createSupabaseServerClient();
  const { data: last } = await supabase
    .from("videos")
    .select("sort_order")
    .eq("category_id", categoryId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle<{ sort_order: number }>();

  const isMp4 = sourceType === "mp4";
  const { data, error } = await supabase
    .from("videos")
    .insert({
      category_id: categoryId,
      title: title.trim(),
      source_type: sourceType,
      source_url: isMp4 ? null : source.trim(),
      video_file: isMp4 ? source.trim() : null,
      aspect_ratio: sourceType === "youtube" && !/shorts\//i.test(source) ? "16:9" : "9:16",
      is_visible: false,
      sort_order: (last?.sort_order ?? 0) + 1,
    })
    .select("id")
    .single<{ id: string }>();
  if (error || !data) return fail(error?.message ?? "建立失敗");
  revalidateVideos(categoryId);
  return { success: true, id: data.id };
}

export async function updateVideo(id: string, categoryId: string, fields: VideoFields): Promise<Result> {
  const { errors } = validateVideo(fields);
  if (errors.length > 0) return fail(errors.join("；"));

  const supabase = await createSupabaseServerClient();
  // At most one featured video per category: clear the others first so
  // the unique index never trips.
  if (fields.is_featured) {
    const { error } = await supabase
      .from("videos")
      .update({ is_featured: false })
      .eq("category_id", categoryId)
      .neq("id", id);
    if (error) return fail(error.message);
  }
  const { error } = await supabase
    .from("videos")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return fail(error.message);
  revalidateVideos(categoryId, id);
  return { success: true };
}

export async function deleteVideo(id: string, categoryId: string): Promise<Result> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("videos").delete().eq("id", id);
  if (error) return fail(error.message);
  revalidateVideos(categoryId);
  return { success: true };
}

export async function reorderVideos(categoryId: string, ids: string[]): Promise<Result> {
  const supabase = await createSupabaseServerClient();
  for (const [i, id] of ids.entries()) {
    const { error } = await supabase.from("videos").update({ sort_order: i + 1 }).eq("id", id);
    if (error) return fail(error.message);
  }
  revalidateVideos(categoryId);
  return { success: true };
}
