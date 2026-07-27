import { supabase } from "@/lib/supabase/client";
import type { Project, SiteContent } from "@/lib/types";

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
