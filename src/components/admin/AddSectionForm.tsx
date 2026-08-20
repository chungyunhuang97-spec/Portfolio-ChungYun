"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "@phosphor-icons/react";
import type { SectionType } from "@/lib/types";

const ALL_SECTION_TYPES: SectionType[] = [
  "hero",
  "overview",
  "challenge",
  "role",
  "process",
  "outcome",
  "reflection",
];

export function AddSectionForm({
  existingTypes,
  nextDisplayOrder,
  onAdd,
}: {
  existingTypes: SectionType[];
  nextDisplayOrder: number;
  onAdd: (
    sectionType: string,
    content: Record<string, unknown>,
    displayOrder: number
  ) => Promise<{ success: boolean; error?: string }>;
}) {
  const router = useRouter();
  const missing = ALL_SECTION_TYPES.filter((t) => !existingTypes.includes(t));
  const [selected, setSelected] = useState<SectionType | "">(missing[0] ?? "");
  const [loading, setLoading] = useState(false);

  if (missing.length === 0) return null;

  async function handleAdd() {
    setLoading(true);
    await onAdd(selected, {}, nextDisplayOrder);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-admin-border-strong bg-admin-surface p-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-medium tracking-[0.1em] text-admin-text-faint">ADD SECTION</label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value as SectionType)}
          className="rounded-md border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-text outline-none focus:border-admin-accent"
        >
          {missing.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={handleAdd}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-md border border-admin-border px-3 py-2 text-xs font-medium text-admin-text-muted transition-colors hover:border-admin-accent hover:text-admin-accent disabled:opacity-50"
      >
        <Plus size={14} weight="bold" />
        {loading ? "ADDING…" : "ADD"}
      </button>
    </div>
  );
}
