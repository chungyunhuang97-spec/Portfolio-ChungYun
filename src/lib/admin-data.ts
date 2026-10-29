import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Project,
  ProjectSection,
  ReelLink,
  SiteContent,
  VideoSectionSettings,
  VideoWork,
} from "@/lib/types";

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

export async function getVideoSectionSettingsAdmin(): Promise<VideoSectionSettings | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("video_section_settings")
    .select("*")
    .maybeSingle<VideoSectionSettings>();

  if (error) {
    console.error("Admin: failed to load video section settings:", error.message);
    return null;
  }
  return data;
}

export async function getAllVideoWorksAdmin(): Promise<VideoWork[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("video_works")
    .select("*")
    .order("type", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Admin: failed to load video works:", error.message);
    return [];
  }
  return (data ?? []) as VideoWork[];
}

export async function getVideoWorkWithReelLinksAdmin(
  id: string
): Promise<{ work: VideoWork; reelLinks: ReelLink[] } | null> {
  const supabase = await createSupabaseServerClient();
  const { data: work, error: workError } = await supabase
    .from("video_works")
    .select("*")
    .eq("id", id)
    .maybeSingle<VideoWork>();

  if (workError || !work) {
    return null;
  }

  const { data: reelLinks, error: reelLinksError } = await supabase
    .from("reel_links")
    .select("*")
    .eq("video_work_id", id)
    .order("sort_order", { ascending: true });

  if (reelLinksError) {
    console.error("Admin: failed to load reel links:", reelLinksError.message);
    return { work, reelLinks: [] };
  }

  return { work, reelLinks: (reelLinks ?? []) as ReelLink[] };
}
