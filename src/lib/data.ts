import { supabase } from "@/lib/supabase/client";
import type { Project, ProjectSection, SiteContent } from "@/lib/types";

export async function getPublishedProjects(
  projectType?: "case_study" | "side_project"
): Promise<Project[]> {
  let query = supabase
    .from("projects")
    .select("*")
    .eq("status", "published")
    .order("display_order", { ascending: true });

  if (projectType) {
    query = query.eq("project_type", projectType);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to load projects:", error.message);
    return [];
  }

  return data ?? [];
}

export async function getSiteContent(key: string): Promise<Record<string, unknown> | null> {
  const { data, error } = await supabase
    .from("site_content")
    .select("*")
    .eq("key", key)
    .maybeSingle<SiteContent>();

  if (error) {
    console.error(`Failed to load site content "${key}":`, error.message);
    return null;
  }

  return data?.content ?? null;
}

export async function getAllSiteContent(): Promise<Record<string, Record<string, unknown>>> {
  const { data, error } = await supabase.from("site_content").select("*");

  if (error) {
    console.error("Failed to load site content:", error.message);
    return {};
  }

  const map: Record<string, Record<string, unknown>> = {};
  for (const row of (data ?? []) as SiteContent[]) {
    map[row.key] = row.content;
  }
  return map;
}

export interface ProjectWithSections {
  project: Project;
  sections: ProjectSection[];
}

export async function getProjectWithSections(
  slug: string
): Promise<ProjectWithSections | null> {
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle<Project>();

  if (projectError) {
    console.error(`Failed to load project "${slug}":`, projectError.message);
    return null;
  }

  if (!project) {
    return null;
  }

  const { data: sections, error: sectionsError } = await supabase
    .from("project_sections")
    .select("*")
    .eq("project_id", project.id)
    .order("display_order", { ascending: true });

  if (sectionsError) {
    console.error(`Failed to load sections for "${slug}":`, sectionsError.message);
    return { project, sections: [] };
  }

  return { project, sections: (sections ?? []) as ProjectSection[] };
}

export async function getAdjacentProjects(
  currentSlug: string
): Promise<{ prev: Project | null; next: Project | null }> {
  const caseStudies = await getPublishedProjects("case_study");
  const index = caseStudies.findIndex((p) => p.slug === currentSlug);

  if (index === -1) {
    return { prev: null, next: null };
  }

  const prev = index > 0 ? caseStudies[index - 1] : null;
  const next = index < caseStudies.length - 1 ? caseStudies[index + 1] : null;

  return { prev, next };
}
