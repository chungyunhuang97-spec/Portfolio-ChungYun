import "server-only";
import { after } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { VersionEntity } from "@/lib/content-versions";

const KEEP_PER_ENTITY = 20;

/**
 * Saves `previous` (the content about to be overwritten) as a history row.
 *
 * Runs through `after()`, i.e. AFTER the response has gone out, so it never
 * adds to how long a save takes. Best-effort by design: if the history table
 * is missing or anything fails, the real save is unaffected. Identical
 * old/new content is skipped, and only the newest 20 rows per entry are kept.
 */
export function snapshotBeforeSave(
  entity: VersionEntity,
  entityKey: string,
  label: string,
  previous: Record<string, unknown> | null | undefined,
  next: Record<string, unknown>
) {
  if (!previous || JSON.stringify(previous) === JSON.stringify(next)) return;

  after(async () => {
    try {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase
        .from("content_versions")
        .insert({ entity, entity_key: entityKey, label, content: previous });
      if (error) return;

      const { data: stale } = await supabase
        .from("content_versions")
        .select("id")
        .eq("entity", entity)
        .eq("entity_key", entityKey)
        .order("created_at", { ascending: false })
        .range(KEEP_PER_ENTITY, KEEP_PER_ENTITY + 200);
      const ids = (stale ?? []).map((r) => r.id);
      if (ids.length > 0) await supabase.from("content_versions").delete().in("id", ids);
    } catch {
      /* history is optional */
    }
  });
}
