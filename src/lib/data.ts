import { supabase } from "@/lib/supabase/client";
import type {
  Project,
  ProjectSection,
  ReelLink,
  SiteContent,
  VideoSectionSettings,
  VideoWork,
} from "@/lib/types";

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

export interface VideoSectionData {
  featured: VideoWork[];
  more: VideoWork[];
  reelLinksByWorkId: Record<string, ReelLink[]>;
}

/**
 * Follows the fetch order from the video-section spec: the section's own
 * visibility flag gates everything else, so an invisible section never
 * pays for the works/reel-links queries that follow it.
 */
export async function getVideoSectionData(): Promise<VideoSectionData | null> {
  const { data: settings, error: settingsError } = await supabase
    .from("video_section_settings")
    .select("*")
    .maybeSingle<VideoSectionSettings>();

  if (settingsError) {
    console.error("Failed to load video section settings:", settingsError.message);
    return null;
  }

  if (!settings?.is_visible) {
    return null;
  }

  const { data: works, error: worksError } = await supabase
    .from("video_works")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (worksError) {
    console.error("Failed to load video works:", worksError.message);
    return null;
  }

  const allWorks = (works ?? []) as VideoWork[];
  const featured = allWorks.filter((w) => w.type === "featured");
  const more = allWorks.filter((w) => w.type === "more");

  // Every "more" work can carry its own reel_links now -- a teaching-reels
  // column and a personal vlog column are both open-ended series, not a
  // single deliverable, so neither is limited to one outbound link.
  const reelLinksByWorkId: Record<string, ReelLink[]> = {};
  const reelWorkIds = more.map((w) => w.id);

  if (reelWorkIds.length > 0) {
    const { data: reelLinks, error: reelLinksError } = await supabase
      .from("reel_links")
      .select("*")
      .in("video_work_id", reelWorkIds)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (reelLinksError) {
      console.error("Failed to load reel links:", reelLinksError.message);
    } else {
      for (const link of (reelLinks ?? []) as ReelLink[]) {
        (reelLinksByWorkId[link.video_work_id] ??= []).push(link);
      }
    }
  }

  return { featured, more, reelLinksByWorkId };
}
