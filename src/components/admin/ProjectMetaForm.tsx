"use client";

import { useState } from "react";
import type { Project, ProjectStatus } from "@/lib/types";

function inputClass() {
  return "w-full border border-line bg-bg px-3 py-2 text-sm outline-none transition-colors focus:border-accent";
}

function labelClass() {
  return "text-xs tracking-[0.15em] text-ink-faint";
}

type MetaFields = {
  title: string;
  subtitle: string | null;
  category: string | null;
  role: string | null;
  timeframe: string | null;
  team: string | null;
  client: string | null;
  external_url: string | null;
  status: ProjectStatus;
  display_order: number;
  tags: string[];
};

export function ProjectMetaForm({
  project,
  onSave,
}: {
  project: Project;
  onSave: (
    projectId: string,
    slug: string,
    fields: MetaFields
  ) => Promise<{ success: boolean; error?: string }>;
}) {
  const [fields, setFields] = useState<MetaFields>({
    title: project.title,
    subtitle: project.subtitle,
    category: project.category,
    role: project.role,
    timeframe: project.timeframe,
    team: project.team,
    client: project.client,
    external_url: project.external_url,
    status: project.status,
    display_order: project.display_order,
    tags: project.tags,
  });
  const [tagsText, setTagsText] = useState(project.tags.join(", "));
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function set<K extends keyof MetaFields>(key: K, value: MetaFields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setStatus("saving");
    setErrorMessage(null);
    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const result = await onSave(project.id, project.slug, { ...fields, tags });
    if (result.success) {
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } else {
      setStatus("error");
      setErrorMessage(result.error ?? "Unknown error");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div className="flex flex-col gap-1.5 md:col-span-2">
        <label className={labelClass()}>TITLE</label>
        <input
          value={fields.title}
          onChange={(e) => set("title", e.target.value)}
          className={inputClass()}
        />
      </div>

      <div className="flex flex-col gap-1.5 md:col-span-2">
        <label className={labelClass()}>SUBTITLE</label>
        <textarea
          rows={2}
          value={fields.subtitle ?? ""}
          onChange={(e) => set("subtitle", e.target.value || null)}
          className={inputClass()}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass()}>CATEGORY</label>
        <input
          value={fields.category ?? ""}
          onChange={(e) => set("category", e.target.value || null)}
          className={inputClass()}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass()}>ROLE</label>
        <input
          value={fields.role ?? ""}
          onChange={(e) => set("role", e.target.value || null)}
          className={inputClass()}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass()}>TIMEFRAME</label>
        <input
          value={fields.timeframe ?? ""}
          onChange={(e) => set("timeframe", e.target.value || null)}
          className={inputClass()}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass()}>TEAM</label>
        <input
          value={fields.team ?? ""}
          onChange={(e) => set("team", e.target.value || null)}
          className={inputClass()}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass()}>CLIENT</label>
        <input
          value={fields.client ?? ""}
          onChange={(e) => set("client", e.target.value || null)}
          className={inputClass()}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass()}>EXTERNAL / DEMO URL</label>
        <input
          value={fields.external_url ?? ""}
          onChange={(e) => set("external_url", e.target.value || null)}
          className={inputClass()}
        />
      </div>

      <div className="flex flex-col gap-1.5 md:col-span-2">
        <label className={labelClass()}>TAGS (comma separated)</label>
        <input
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          className={inputClass()}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass()}>STATUS</label>
        <select
          value={fields.status}
          onChange={(e) => set("status", e.target.value as ProjectStatus)}
          className={inputClass()}
        >
          <option value="draft">draft</option>
          <option value="published">published</option>
          <option value="archived">archived</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass()}>DISPLAY ORDER</label>
        <input
          type="number"
          value={fields.display_order}
          onChange={(e) => set("display_order", Number(e.target.value))}
          className={inputClass()}
        />
      </div>

      <div className="flex items-center gap-4 md:col-span-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={status === "saving"}
          className="border border-ink bg-ink px-5 py-2.5 text-sm tracking-wide text-bg transition-colors hover:border-accent hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "saving" ? "Saving…" : "Save details"}
        </button>
        {status === "saved" && <span className="text-sm text-emerald-700">Saved</span>}
        {status === "error" && <span className="text-sm text-red-700">{errorMessage}</span>}
      </div>
    </div>
  );
}
