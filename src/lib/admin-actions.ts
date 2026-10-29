"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProjectStatus, VideoEmbedType, VideoWorkType } from "@/lib/types";

export async function updateProjectMeta(
  projectId: string,
  slug: string,
  fields: {
    title: string;
    subtitle: string | null;
    category: string | null;
    role: string | null;
    timeframe: string | null;
    team: string | null;
    client: string | null;
    external_url: string | null;
    status: ProjectStatus;
    display_order: number;
    tags: string[];
    footer_copyright: string | null;
  }
) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("projects").update(fields).eq("id", projectId);

  if (error) {
    return { success: false as const, error: error.message };
  }

  revalidatePath("/");
  revalidatePath(`/work/${slug}`);
  revalidatePath(`/admin/projects/${slug}`);
  return { success: true as const };
}

export async function upsertSection(
  projectId: string,
  slug: string,
  sectionType: string,
  content: Record<string, unknown>,
  displayOrder: number
) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("project_sections").upsert(
    {
      project_id: projectId,
      section_type: sectionType,
      content,
      display_order: displayOrder,
    },
    { onConflict: "project_id,section_type" }
  );

  if (error) {
    return { success: false as const, error: error.message };
  }

  revalidatePath("/");
  revalidatePath(`/work/${slug}`);
  revalidatePath(`/admin/projects/${slug}`);
  return { success: true as const };
}

export async function deleteSection(sectionId: string, slug: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("project_sections").delete().eq("id", sectionId);

  if (error) {
    return { success: false as const, error: error.message };
  }

  revalidatePath("/");
  revalidatePath(`/work/${slug}`);
  revalidatePath(`/admin/projects/${slug}`);
  return { success: true as const };
}

export async function updateSiteContent(key: string, content: Record<string, unknown>) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("site_content").update({ content }).eq("key", key);

  if (error) {
    return { success: false as const, error: error.message };
  }

  revalidatePath("/");
  revalidatePath(`/admin/site-content/${key}`);
  return { success: true as const };
}

function revalidateVideoSection(workId?: string) {
  revalidatePath("/");
  revalidatePath("/admin/video-section");
  if (workId) revalidatePath(`/admin/video-section/${workId}`);
}

export async function updateVideoSectionVisibility(settingsId: string, isVisible: boolean) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("video_section_settings")
    .update({ is_visible: isVisible, updated_at: new Date().toISOString() })
    .eq("id", settingsId);

  if (error) {
    return { success: false as const, error: error.message };
  }

  revalidateVideoSection();
  return { success: true as const };
}

export async function createVideoWork(type: VideoWorkType, title: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("video_works")
    .insert({ type, title, tags: [] })
    .select("id")
    .single();

  if (error) {
    return { success: false as const, error: error.message };
  }

  revalidateVideoSection();
  return { success: true as const, id: data.id as string };
}

export interface VideoWorkFields {
  title: string;
  subtitle: string | null;
  description: string | null;
  role_items: string[] | null;
  tags: string[];
  thumbnail_url: string | null;
  video_url: string | null;
  embed_type: VideoEmbedType | null;
  brief_image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export async function updateVideoWork(workId: string, fields: VideoWorkFields) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("video_works").update(fields).eq("id", workId);

  if (error) {
    return { success: false as const, error: error.message };
  }

  revalidateVideoSection(workId);
  return { success: true as const };
}

export async function deleteVideoWork(workId: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("video_works").delete().eq("id", workId);

  if (error) {
    return { success: false as const, error: error.message };
  }

  revalidateVideoSection();
  return { success: true as const };
}

export interface ReelLinkFields {
  label: string;
  url: string;
  sort_order: number;
  is_active: boolean;
}

export async function createReelLink(videoWorkId: string, fields: ReelLinkFields) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("reel_links")
    .insert({ video_work_id: videoWorkId, ...fields });

  if (error) {
    return { success: false as const, error: error.message };
  }

  revalidateVideoSection(videoWorkId);
  return { success: true as const };
}

export async function updateReelLink(linkId: string, videoWorkId: string, fields: ReelLinkFields) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("reel_links").update(fields).eq("id", linkId);

  if (error) {
    return { success: false as const, error: error.message };
  }

  revalidateVideoSection(videoWorkId);
  return { success: true as const };
}

export async function deleteReelLink(linkId: string, videoWorkId: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("reel_links").delete().eq("id", linkId);

  if (error) {
    return { success: false as const, error: error.message };
  }

  revalidateVideoSection(videoWorkId);
  return { success: true as const };
}
