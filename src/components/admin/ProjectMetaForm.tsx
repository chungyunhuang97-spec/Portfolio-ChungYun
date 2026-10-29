"use client";

import { useMemo, useState } from "react";
import { useTrackChanges } from "@/components/admin/ChangesContext";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { AdminMediaDropzone } from "@/components/admin/AdminMediaDropzone";
import { BentoPreviewMini, type BentoPreviewProject } from "@/components/admin/BentoPreviewMini";
import type {
  BadgeStatus,
  CardSize,
  CardTheme,
  Decoration,
  DecorationPosition,
  Project,
  ProjectStatus,
} from "@/lib/types";

const HOVER_VIDEO_MAX_BYTES = 3 * 1024 * 1024;
const OUTCOME_MAX_CHARS = 60;

function inputClass() {
  return "w-full rounded-md border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-text outline-none transition-colors focus:border-admin-accent";
}

function labelClass() {
  return "text-[11px] font-medium tracking-[0.1em] text-admin-text-faint";
}

function sectionHeadingClass() {
  return "text-[11px] font-semibold tracking-[0.15em] text-admin-text-faint";
}

type MetaFields = {
  title: string;
  title_en: string | null;
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
  is_visible: boolean;
  card_size: CardSize;
  card_theme: CardTheme;
  cover_image_url: string | null;
  cover_image_mobile: string | null;
  cover_alt: string | null;
  outcome: string | null;
  year: number | null;
  badge_status: BadgeStatus | null;
  decoration: Decoration;
  decoration_position: DecorationPosition;
  animate_decoration: boolean;
  enter_rotation: number | null;
  hover_preview_video: string | null;
  max_tags_on_card: number;
};

function fieldsFromProject(project: Project): MetaFields {
  return {
    title: project.title,
    title_en: project.title_en ?? null,
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
    is_visible: project.is_visible,
    card_size: project.card_size,
    card_theme: project.card_theme,
    cover_image_url: project.cover_image_url,
    cover_image_mobile: project.cover_image_mobile,
    cover_alt: project.cover_alt,
    outcome: project.outcome,
    year: project.year,
    badge_status: project.badge_status,
    decoration: project.decoration,
    decoration_position: project.decoration_position,
    animate_decoration: project.animate_decoration,
    enter_rotation: project.enter_rotation,
    hover_preview_video: project.hover_preview_video,
    max_tags_on_card: project.max_tags_on_card,
  };
}

export function ProjectMetaForm({
  project,
  onSave,
  siblingProjects = [],
}: {
  project: Project;
  onSave: (
    projectId: string,
    slug: string,
    fields: MetaFields
  ) => Promise<{ success: boolean; error?: string }>;
  /** Every OTHER Bento-eligible project, for the mini preview and the
   * "only one `large` card" warning. Doesn't include `project` itself --
   * this form's own pending edits stand in for that. */
  siblingProjects?: BentoPreviewProject[];
}) {
  const initial = fieldsFromProject(project);

  const [fields, setFields] = useState<MetaFields>(initial);
  const [tagsText, setTagsText] = useState(project.tags.join(", "));
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [baseline, setBaseline] = useState<MetaFields>(initial);

  function set<K extends keyof MetaFields>(key: K, value: MetaFields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  const coverAltMissing = Boolean(fields.cover_image_url) && !fields.cover_alt?.trim();
  const outcomeTooLong = (fields.outcome?.length ?? 0) > OUTCOME_MAX_CHARS;

  async function handleSave() {
    if (coverAltMissing) {
      setStatus("error");
      setErrorMessage("有封面圖時，COVER ALT 為必填");
      return;
    }

    setStatus("saving");
    setErrorMessage(null);
    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const nextFields: MetaFields = {
      ...fields,
      tags,
      enter_rotation:
        fields.enter_rotation === null
          ? null
          : Math.max(-8, Math.min(8, Math.round(fields.enter_rotation))),
    };
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

  const previewProjects: BentoPreviewProject[] = useMemo(() => {
    const self: BentoPreviewProject = {
      id: project.id,
      slug: project.slug,
      title: fields.title,
      card_size: fields.card_size,
      is_visible: fields.is_visible,
      card_theme: fields.card_theme,
    };
    return [...siblingProjects, self].sort((a, b) => (a.slug < b.slug ? -1 : 1));
  }, [siblingProjects, project.id, project.slug, fields.title, fields.card_size, fields.is_visible, fields.card_theme]);

  return (
    <div className="flex flex-col gap-8">
      {(isDirty || status !== "idle") && (
        <div>
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

      {/* --- Basic details (unchanged) --- */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className={labelClass()}>TITLE</label>
          <input value={fields.title} onChange={(e) => set("title", e.target.value)} className={inputClass()} />
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className={labelClass()}>TITLE (EN)</label>
          <input
            value={fields.title_en ?? ""}
            onChange={(e) => set("title_en", e.target.value || null)}
            className={inputClass()}
            placeholder="例如：Taipei Metro Ticketing Kiosk"
          />
          <p className="text-xs text-admin-text-faint">選填，只顯示在首頁 Bento 卡片的中文標題下方</p>
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
            placeholder="例如：FinTech、Kiosk、Hackathon"
          />
          <p className="text-xs text-admin-text-faint">也會顯示在 Bento 卡片的 Meta 列</p>
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
          <input value={tagsText} onChange={(e) => setTagsText(e.target.value)} className={inputClass()} />
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
          <p className="text-xs text-admin-text-faint">也是 Bento 卡片的排序（拖曳排序見 Dashboard 清單）</p>
        </div>
      </div>

      {/* --- Bento grid placement --- */}
      <div className="border-t border-admin-border pt-6">
        <h3 className={sectionHeadingClass()}>BENTO GRID</h3>
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="flex items-center gap-2 md:col-span-2">
            <input
              id="is_visible"
              type="checkbox"
              checked={fields.is_visible}
              onChange={(e) => set("is_visible", e.target.checked)}
              className="size-4 rounded border-admin-border accent-admin-accent"
            />
            <label htmlFor="is_visible" className="text-sm text-admin-text">
              顯示在首頁 Bento Grid
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass()}>CARD SIZE</label>
            <select
              value={fields.card_size}
              onChange={(e) => set("card_size", e.target.value as CardSize)}
              className={inputClass()}
            >
              <option value="large">large</option>
              <option value="wide">wide</option>
              <option value="small">small</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass()}>CARD THEME</label>
            <select
              value={fields.card_theme}
              onChange={(e) => set("card_theme", e.target.value as CardTheme)}
              className={inputClass()}
            >
              <option value="cream">cream</option>
              <option value="blue">blue</option>
              <option value="red">red</option>
              <option value="white">white</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass()}>MAX TAGS ON CARD</label>
            <input
              type="number"
              min={0}
              max={6}
              value={fields.max_tags_on_card}
              onChange={(e) => set("max_tags_on_card", Number(e.target.value))}
              className={inputClass()}
            />
          </div>
        </div>

        <div className="mt-4">
          <BentoPreviewMini projects={previewProjects} currentProjectId={project.id} />
        </div>
      </div>

      {/* --- Cover media --- */}
      <div className="border-t border-admin-border pt-6">
        <h3 className={sectionHeadingClass()}>COVER</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-[10px] tracking-[0.1em] text-admin-text-faint">DESKTOP（建議 1600px 寬）</p>
            <AdminMediaDropzone
              value={fields.cover_image_url ?? ""}
              onChange={(v) => set("cover_image_url", v || null)}
              mediaPathPrefix={`${project.slug}/cover`}
            />
          </div>
          <div>
            <p className="mb-1.5 text-[10px] tracking-[0.1em] text-admin-text-faint">
              MOBILE（建議 900px 寬、4:5 或 4:3；留空則退回 Desktop 封面）
            </p>
            <AdminMediaDropzone
              value={fields.cover_image_mobile ?? ""}
              onChange={(v) => set("cover_image_mobile", v || null)}
              mediaPathPrefix={`${project.slug}/cover-mobile`}
            />
          </div>
        </div>

        {(fields.cover_image_url || fields.cover_image_mobile) && (
          <div className="mt-3 flex gap-3">
            {fields.cover_image_url && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] tracking-[0.1em] text-admin-text-faint">DESKTOP 4:3 裁切</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fields.cover_image_url}
                  alt=""
                  className="h-20 w-28 rounded-md border border-admin-border object-cover"
                />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] tracking-[0.1em] text-admin-text-faint">MOBILE 4:5 裁切</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fields.cover_image_mobile || fields.cover_image_url || ""}
                alt=""
                className="h-24 w-20 rounded-md border border-admin-border object-cover"
              />
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-1.5">
          <label className={labelClass()}>COVER ALT（無障礙替代文字）</label>
          <input
            value={fields.cover_alt ?? ""}
            onChange={(e) => set("cover_alt", e.target.value || null)}
            className={`${inputClass()} ${coverAltMissing ? "border-admin-danger" : ""}`}
          />
          {coverAltMissing && (
            <p className="text-xs text-admin-danger">有封面圖時，COVER ALT 為必填，否則無法儲存</p>
          )}
        </div>
      </div>

      {/* --- Card copy --- */}
      <div className="border-t border-admin-border pt-6">
        <h3 className={sectionHeadingClass()}>CARD COPY</h3>
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className={labelClass()}>OUTCOME（卡片上的一句成果，例如「+18%」「LIVE」）</label>
            <input
              value={fields.outcome ?? ""}
              onChange={(e) => set("outcome", e.target.value || null)}
              className={`${inputClass()} ${outcomeTooLong ? "border-admin-warning" : ""}`}
              maxLength={200}
            />
            <p className={`text-xs ${outcomeTooLong ? "text-admin-warning" : "text-admin-text-faint"}`}>
              {fields.outcome?.length ?? 0}/{OUTCOME_MAX_CHARS} 字{outcomeTooLong ? " — 超過建議長度" : ""}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass()}>YEAR</label>
            <input
              type="number"
              value={fields.year ?? ""}
              onChange={(e) => set("year", e.target.value === "" ? null : Number(e.target.value))}
              className={inputClass()}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass()}>BADGE STATUS</label>
            <select
              value={fields.badge_status ?? ""}
              onChange={(e) => set("badge_status", (e.target.value || null) as BadgeStatus | null)}
              className={inputClass()}
            >
              <option value="">（無）</option>
              <option value="shipped">shipped</option>
              <option value="live">live</option>
              <option value="demo">demo</option>
              <option value="concept">concept</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- Decoration & entrance --- */}
      <div className="border-t border-admin-border pt-6">
        <h3 className={sectionHeadingClass()}>DECORATION &amp; 進場動態</h3>
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass()}>DECORATION</label>
            <select
              value={fields.decoration}
              onChange={(e) => set("decoration", e.target.value as Decoration)}
              className={inputClass()}
            >
              <option value="none">none</option>
              <option value="star">star</option>
              <option value="spiral">spiral</option>
              <option value="eye">eye</option>
              <option value="zigzag">zigzag</option>
              <option value="plus">plus</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass()}>DECORATION POSITION</label>
            <select
              value={fields.decoration_position}
              onChange={(e) => set("decoration_position", e.target.value as DecorationPosition)}
              disabled={fields.decoration === "none"}
              className={`${inputClass()} ${fields.decoration === "none" ? "opacity-50" : ""}`}
            >
              <option value="top-left">top-left</option>
              <option value="top-right">top-right</option>
              <option value="bottom-left">bottom-left</option>
              <option value="bottom-right">bottom-right</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="animate_decoration"
              type="checkbox"
              checked={fields.animate_decoration}
              onChange={(e) => set("animate_decoration", e.target.checked)}
              disabled={fields.decoration === "none"}
              className="size-4 rounded border-admin-border accent-admin-accent"
            />
            <label htmlFor="animate_decoration" className="text-sm text-admin-text">
              播放裝飾描邊動畫
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass()}>ENTER ROTATION（-8 ~ 8，留空 = 依序自動交替）</label>
            <input
              type="number"
              min={-8}
              max={8}
              value={fields.enter_rotation ?? ""}
              onChange={(e) => set("enter_rotation", e.target.value === "" ? null : Number(e.target.value))}
              className={inputClass()}
            />
          </div>
        </div>
      </div>

      {/* --- Hover preview video --- */}
      <div className="border-t border-admin-border pt-6">
        <h3 className={sectionHeadingClass()}>HOVER PREVIEW VIDEO（選填，滑鼠裝置限定，≤3MB）</h3>
        <div className="mt-4">
          <AdminMediaDropzone
            value={fields.hover_preview_video ?? ""}
            onChange={(v) => set("hover_preview_video", v || null)}
            mediaPathPrefix={`${project.slug}/hover-preview`}
            warnIfOverBytes={HOVER_VIDEO_MAX_BYTES}
          />
        </div>
      </div>
    </div>
  );
}
