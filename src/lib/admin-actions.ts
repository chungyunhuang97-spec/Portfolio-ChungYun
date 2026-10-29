"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { BadgeStatus, CardSize, CardTheme, Decoration, DecorationPosition, ProjectStatus } from "@/lib/types";

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
    is_visible: boolean;
    card_size: CardSize;
    card_theme: CardTheme;
    cover_image_url: string | null;
    cover_image_mobile: string | null;
    cover_alt: string | null;
    outcome: string | null;
    year: number | null;
    badge_status: BadgeStatus | null;
    decoration: Decoration;
    decoration_position: DecorationPosition;
    animate_decoration: boolean;
    enter_rotation: number | null;
    hover_preview_video: string | null;
    max_tags_on_card: number;
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

/** Persists a drag-reordered project list in one round trip. Sequential
 * (not Promise.all) for the same reason ChangesStore.saveAll is sequential
 * -- these are writes to different rows, but a burst of concurrent
 * updates to the same table from one reorder gesture isn't worth it here. */
export async function reorderProjects(updates: { id: string; display_order: number }[]) {
  const supabase = await createSupabaseServerClient();

  for (const { id, display_order } of updates) {
    const { error } = await supabase.from("projects").update({ display_order }).eq("id", id);
    if (error) {
      return { success: false as const, error: error.message };
    }
  }

  revalidatePath("/");
  revalidatePath("/admin");
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
