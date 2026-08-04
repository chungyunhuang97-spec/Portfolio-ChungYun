"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Breakpoint, LayoutBlock, PageLayout } from "@/lib/layout-types";
import { emptyLayout } from "@/lib/layout-types";

/**
 * Persists the block list for ONE breakpoint of a page's canvas layout,
 * merging it into whatever the other two breakpoints already have (each
 * breakpoint is edited/saved independently). Revalidates the public page
 * immediately after write, so "save" in the editor becomes live within
 * seconds via Next.js on-demand ISR -- no rebuild/redeploy needed.
 */
export async function savePageLayoutBreakpoint(
  slug: string,
  breakpoint: Breakpoint,
  blocks: LayoutBlock[]
) {
  const supabase = await createSupabaseServerClient();

  const { data: existing, error: readError } = await supabase
    .from("page_layouts")
    .select("layout")
    .eq("page_slug", slug)
    .eq("page_type", "project")
    .maybeSingle<{ layout: PageLayout }>();

  if (readError) {
    return { success: false as const, error: readError.message };
  }

  const nextLayout: PageLayout = existing?.layout
    ? { ...existing.layout, [breakpoint]: blocks }
    : { ...emptyLayout(), [breakpoint]: blocks };

  const { error: writeError } = await supabase.from("page_layouts").upsert(
    {
      page_slug: slug,
      page_type: "project",
      layout: nextLayout,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "page_slug,page_type" }
  );

  if (writeError) {
    return { success: false as const, error: writeError.message };
  }

  revalidatePath(`/work/${slug}`);
  revalidatePath(`/admin/projects/${slug}/edit`);
  return { success: true as const };
}

/** Updates a section's text content from the canvas (inline edit -> save). */
export async function updateSectionText(sectionId: string, slug: string, text: string) {
  const supabase = await createSupabaseServerClient();
  const { data: section, error: readError } = await supabase
    .from("project_sections")
    .select("content")
    .eq("id", sectionId)
    .maybeSingle<{ content: Record<string, unknown> }>();

  if (readError) {
    return { success: false as const, error: readError.message };
  }

  const nextContent = { ...(section?.content ?? {}), text };

  const { error: writeError } = await supabase
    .from("project_sections")
    .update({ content: nextContent })
    .eq("id", sectionId);

  if (writeError) {
    return { success: false as const, error: writeError.message };
  }

  revalidatePath(`/work/${slug}`);
  revalidatePath(`/admin/projects/${slug}/edit`);
  return { success: true as const };
}

/** Updates a hero-level text field (title/subtitle/tagline) on the project row. */
export async function updateHeroText(
  projectId: string,
  slug: string,
  field: "title" | "subtitle" | "tagline",
  value: string
) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("projects")
    .update({ [field]: value })
    .eq("id", projectId);

  if (error) {
    return { success: false as const, error: error.message };
  }

  revalidatePath(`/work/${slug}`);
  revalidatePath(`/admin/projects/${slug}/edit`);
  return { success: true as const };
}
