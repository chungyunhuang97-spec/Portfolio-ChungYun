"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type VersionEntity = "project_section" | "site_content";

export interface ContentVersion {
  id: string;
  label: string | null;
  content: Record<string, unknown>;
  created_at: string;
}

const KEEP_PER_ENTITY = 20;

/**
 * Stores `content` as a snapshot of (entity, key). Best-effort by design:
 * if the history table isn't there yet (migration not applied) or the insert
 * fails, the real save must still go ahead, so every error is swallowed.
 * Skips the insert when the newest snapshot is already identical.
 */
export async function snapshotBeforeSave(
  entity: VersionEntity,
  entityKey: string,
  label: string,
  content: Record<string, unknown> | null | undefined
) {
  if (!content) return;
  try {
    const supabase = await createSupabaseServerClient();
    const { data: latest, error: readError } = await supabase
      .from("content_versions")
      .select("id, content")
      .eq("entity", entity)
      .eq("entity_key", entityKey)
      .order("created_at", { ascending: false })
      .limit(1);
    if (readError) return;
    if (latest?.[0] && JSON.stringify(latest[0].content) === JSON.stringify(content)) return;

    const { error } = await supabase
      .from("content_versions")
      .insert({ entity, entity_key: entityKey, label, content });
    if (error) return;

    const { data: all } = await supabase
      .from("content_versions")
      .select("id")
      .eq("entity", entity)
      .eq("entity_key", entityKey)
      .order("created_at", { ascending: false });
    const stale = (all ?? []).slice(KEEP_PER_ENTITY).map((r) => r.id);
    if (stale.length > 0) await supabase.from("content_versions").delete().in("id", stale);
  } catch {
    /* history is optional */
  }
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
    .limit(KEEP_PER_ENTITY);
  if (error) return { available: false, versions: [] };
  return { available: true, versions: (data ?? []) as ContentVersion[] };
}
