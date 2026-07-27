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
    <div className="flex items-end gap-2 border border-dashed border-line p-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs tracking-[0.15em] text-ink-faint">ADD SECTION</label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value as SectionType)}
          className="border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
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
        className="inline-flex items-center gap-1.5 border border-line px-3 py-2 text-xs tracking-wide text-ink-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
      >
        <Plus size={14} weight="light" />
        {loading ? "ADDING…" : "ADD"}
      </button>
    </div>
  );
}
