import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AboutContent,
  AboutStat,
  AboutTool,
  AboutTrait,
  Project,
  ProjectSection,
  SiteContent,
  Video,
  VideoCategory,
  VideoCategoryWithVideos,
  VideoSectionSettings,
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

/* --- About v2 --- */

export interface AboutAdminData {
  content: AboutContent | null;
  traits: AboutTrait[];
  stats: AboutStat[];
  tools: AboutTool[];
}

export async function getAboutAdmin(): Promise<AboutAdminData> {
  const supabase = await createSupabaseServerClient();
  const [content, traits, stats, tools] = await Promise.all([
    supabase.from("about_content").select("*").maybeSingle<AboutContent>(),
    supabase.from("about_traits").select("*").order("sort_order", { ascending: true }),
    supabase.from("about_stats").select("*").order("sort_order", { ascending: true }),
    supabase.from("about_tools").select("*").order("sort_order", { ascending: true }),
  ]);
  for (const r of [content, traits, stats, tools]) {
    if (r.error) console.error("Admin: failed to load about data:", r.error.message);
  }
  return {
    content: content.data ?? null,
    traits: (traits.data ?? []) as AboutTrait[],
    stats: (stats.data ?? []) as AboutStat[],
    tools: (tools.data ?? []) as AboutTool[],
  };
}

/* --- Video Works v2 --- */

export async function getVideoCategoriesWithVideosAdmin(): Promise<VideoCategoryWithVideos[]> {
  const supabase = await createSupabaseServerClient();
  const [categories, videos] = await Promise.all([
    supabase.from("video_categories").select("*").order("sort_order", { ascending: true }),
    supabase.from("videos").select("*").order("sort_order", { ascending: true }),
  ]);
  if (categories.error) console.error("Admin: failed to load video categories:", categories.error.message);
  if (videos.error) console.error("Admin: failed to load videos:", videos.error.message);
  const all = (videos.data ?? []) as Video[];
  return ((categories.data ?? []) as VideoCategory[]).map((c) => ({
    ...c,
    videos: all.filter((v) => v.category_id === c.id),
  }));
}

export async function getVideoCategoryAdmin(id: string): Promise<VideoCategoryWithVideos | null> {
  const supabase = await createSupabaseServerClient();
  const { data: category, error } = await supabase
    .from("video_categories")
    .select("*")
    .eq("id", id)
    .maybeSingle<VideoCategory>();
  if (error || !category) return null;
  const { data: videos } = await supabase
    .from("videos")
    .select("*")
    .eq("category_id", id)
    .order("sort_order", { ascending: true });
  return { ...category, videos: (videos ?? []) as Video[] };
}

export async function getVideoAdmin(
  id: string
): Promise<{ video: Video; category: VideoCategory } | null> {
  const supabase = await createSupabaseServerClient();
  const { data: video, error } = await supabase.from("videos").select("*").eq("id", id).maybeSingle<Video>();
  if (error || !video) return null;
  const { data: category } = await supabase
    .from("video_categories")
    .select("*")
    .eq("id", video.category_id)
    .maybeSingle<VideoCategory>();
  if (!category) return null;
  return { video, category };
}
