import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Project, ProjectSection, SiteContent } from "@/lib/types";

export async function getAllProjectsAdmin(): Promise<Project[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("project_type", { ascending: true })
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Admin: failed to load projects:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getProjectWithSectionsAdmin(
  slug: string
): Promise<{ project: Project; sections: ProjectSection[] } | null> {
  const supabase = await createSupabaseServerClient();
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle<Project>();

  if (projectError || !project) {
    return null;
  }

  const { data: sections, error: sectionsError } = await supabase
    .from("project_sections")
    .select("*")
    .eq("project_id", project.id)
    .order("display_order", { ascending: true });

  if (sectionsError) {
    console.error("Admin: failed to load sections:", sectionsError.message);
    return { project, sections: [] };
  }

  return { project, sections: (sections ?? []) as ProjectSection[] };
}

export async function getAllSiteContentAdmin(): Promise<SiteContent[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("site_content").select("*").order("key");

  if (error) {
    console.error("Admin: failed to load site content:", error.message);
    return [];
  }
  return (data ?? []) as SiteContent[];
}
