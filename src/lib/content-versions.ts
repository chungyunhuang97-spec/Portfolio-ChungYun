"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type VersionEntity = "project_section" | "site_content";

export interface ContentVersion {
  id: string;
  label: string | null;
  content: Record<string, unknown>;
  created_at: string;
}

/** Newest-first list. `available: false` means the history table is missing. */
export async function listContentVersions(
  entity: VersionEntity,
  entityKey: string
): Promise<{ available: boolean; versions: ContentVersion[] }> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("content_versions")
    .select("id, label, content, created_at")
    .eq("entity", entity)
    .eq("entity_key", entityKey)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) return { available: false, versions: [] };
  return { available: true, versions: (data ?? []) as ContentVersion[] };
}
