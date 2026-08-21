"use client";

import { useMemo, useState } from "react";
import { useTrackChanges } from "@/components/admin/ChangesContext";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { Project, ProjectStatus } from "@/lib/types";

function inputClass() {
  return "w-full rounded-md border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-text outline-none transition-colors focus:border-admin-accent";
}

function labelClass() {
  return "text-[11px] font-medium tracking-[0.1em] text-admin-text-faint";
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
  footer_copyright: string | null;
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
  const initial: MetaFields = {
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
    footer_copyright: project.footer_copyright,
  };

  const [fields, setFields] = useState<MetaFields>(initial);
  const [tagsText, setTagsText] = useState(project.tags.join(", "));
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [baseline, setBaseline] = useState<MetaFields>(initial);

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
    const nextFields = { ...fields, tags };
    const result = await onSave(project.id, project.slug, nextFields);
    if (result.success) {
      setBaseline(nextFields);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } else {
      setStatus("error");
      setErrorMessage(result.error ?? "Unknown error");
    }
  }

  const currentFields = useMemo(() => {
    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    return { ...fields, tags };
  }, [fields, tagsText]);

  const isDirty = JSON.stringify(currentFields) !== JSON.stringify(baseline);

  useTrackChanges(`meta-${project.id}`, "DETAILS", isDirty, handleSave);

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {(isDirty || status !== "idle") && (
        <div className="md:col-span-2">
          {isDirty && status !== "saving" && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-admin-warning">
              <span className="h-1.5 w-1.5 rounded-full bg-admin-warning" />
              未儲存
            </span>
          )}
          {status === "saving" && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-admin-text-faint">
              <span className="h-1.5 w-1.5 rounded-full bg-admin-text-faint" />
              儲存中…
            </span>
          )}
          {status === "saved" && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-admin-success">
              <span className="h-1.5 w-1.5 rounded-full bg-admin-success" />
              已儲存
            </span>
          )}
          {status === "error" && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-admin-danger">
              <span className="h-1.5 w-1.5 rounded-full bg-admin-danger" />
              {errorMessage}
            </span>
          )}
        </div>
      )}
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
        <label className={labelClass()}>FOOTER COPYRIGHT</label>
        <input
          value={fields.footer_copyright ?? ""}
          onChange={(e) => set("footer_copyright", e.target.value || null)}
          placeholder={`© ${new Date().getFullYear()} ${project.title}. All rights reserved.`}
          className={inputClass()}
        />
        <p className="text-xs text-admin-text-faint">
          顯示在頁尾左下角，留空則自動帶入「© 年份 專案標題. All rights reserved.」
        </p>
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
        <div className="mt-1">
          <StatusBadge status={fields.status} />
        </div>
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
    </div>
  );
}
