"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProjectStatus } from "@/lib/types";

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
