"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CaretDown } from "@phosphor-icons/react";
import { useTrackChanges } from "@/components/admin/ChangesContext";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { AdminMediaDropzone } from "@/components/admin/AdminMediaDropzone";
import { COVER_DESKTOP_GUIDE, COVER_MOBILE_GUIDE, HOVER_PREVIEW_GUIDE } from "@/lib/admin-field-guide";
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

/** One field: Chinese name, optional hint, input below. `en` is the raw
 * database column, kept small so it stays searchable / recognisable. */
function Field({
  label,
  en,
  hint,
  className = "",
  htmlFor,
  children,
}: {
  label: string;
  en?: string;
  hint?: string;
  className?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-admin-text">
        {label}
        {en && <span className="ml-2 font-mono text-[10px] font-normal text-admin-text-faint">{en}</span>}
      </label>
      {children}
      {hint && <p className="text-xs leading-relaxed text-admin-text-faint">{hint}</p>}
    </div>
  );
}

/** Collapsible group with a one-line summary, so the form stays scannable. */
function Group({
  id,
  title,
  summary,
  defaultOpen = false,
  issue,
  children,
}: {
  id?: string;
  title: string;
  summary?: string;
  defaultOpen?: boolean;
  /** Short warning shown on the collapsed header (e.g. "缺少封面圖"). */
  issue?: string | null;
  children: ReactNode;
}) {
  return (
    <details id={id} open={defaultOpen} className="group scroll-mt-32 rounded-lg border border-admin-border bg-admin-surface">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
        <CaretDown size={14} weight="bold" className="shrink-0 -rotate-90 text-admin-text-faint transition-transform group-open:rotate-0" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-admin-text">{title}</span>
          {summary && <span className="block truncate text-xs text-admin-text-faint">{summary}</span>}
        </span>
        {issue && (
          <span className="shrink-0 rounded-full bg-admin-warning-soft px-2.5 py-1 text-[10px] font-medium text-admin-warning">{issue}</span>
        )}
      </summary>
      <div className="border-t border-admin-border px-4 py-5">{children}</div>
    </details>
  );
}

const STATUS_HELP: Record<ProjectStatus, string> = {
  draft: "草稿：只有登入後台的你看得到，前台不會出現",
  published: "已發佈：前台公開，可以被所有人看到",
  archived: "封存：從前台移除，但資料保留在後台",
};

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
  const router = useRouter();
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
      setErrorMessage("有封面圖時，請填寫「封面替代文字」");
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
      // The sidebar shows this project's title and status; the save no longer
      // re-renders the whole page, so refresh only when one of those changed.
      if (nextFields.title !== baseline.title || nextFields.status !== baseline.status) router.refresh();
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

  useTrackChanges(`meta-${project.id}`, "專案資訊", isDirty, handleSave);

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

  const CARD_SIZE_LABEL: Record<CardSize, string> = { large: "大卡（large）", wide: "寬卡（wide）", small: "小卡（small）" };
  const THEME_LABEL: Record<CardTheme, string> = { cream: "奶油（cream）", blue: "藍（blue）", red: "紅（red）", white: "白（white）" };
  const DECORATION_LABEL: Record<Decoration, string> = {
    none: "無",
    star: "星星（star）",
    spiral: "螺旋（spiral）",
    eye: "眼睛（eye）",
    zigzag: "鋸齒（zigzag）",
    plus: "加號（plus）",
  };
  const POSITION_LABEL: Record<DecorationPosition, string> = {
    "top-left": "左上",
    "top-right": "右上",
    "bottom-left": "左下",
    "bottom-right": "右下",
  };
  const BADGE_LABEL: Record<BadgeStatus, string> = {
    shipped: "已交付（shipped）",
    live: "線上運行（live）",
    demo: "展示版（demo）",
    concept: "概念稿（concept）",
  };

  const statusSummary = { draft: "草稿", published: "已發佈", archived: "封存" }[fields.status];
  const coverIssue = !fields.cover_image_url ? "缺少封面圖" : coverAltMissing ? "缺少替代文字" : null;

  return (
    <div className="flex flex-col gap-3">
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

      <Group id="group-basic" title="基本資訊" summary={`${fields.title}${fields.category ? ` · ${fields.category}` : ""}`} defaultOpen>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="專案標題" en="title" className="md:col-span-2">
            <input value={fields.title} onChange={(e) => set("title", e.target.value)} className={inputClass()} />
          </Field>

          <Field label="英文標題" en="title_en" hint="選填，只顯示在首頁卡片的中文標題下方" className="md:col-span-2">
            <input
              value={fields.title_en ?? ""}
              onChange={(e) => set("title_en", e.target.value || null)}
              className={inputClass()}
              placeholder="例如：Taipei Metro Ticketing Kiosk"
            />
          </Field>

          <Field label="副標題" en="subtitle" hint="專案頁 Hero 標題下方的一句話" className="md:col-span-2">
            <textarea rows={2} value={fields.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value || null)} className={inputClass()} />
          </Field>

          <Field label="類別" en="category" hint="也會顯示在首頁卡片的資訊列">
            <input
              value={fields.category ?? ""}
              onChange={(e) => set("category", e.target.value || null)}
              className={inputClass()}
              placeholder="例如：FinTech、Kiosk、Hackathon"
            />
          </Field>

          <Field label="我的角色" en="role">
            <input value={fields.role ?? ""} onChange={(e) => set("role", e.target.value || null)} className={inputClass()} />
          </Field>

          <Field label="專案期間" en="timeframe">
            <input value={fields.timeframe ?? ""} onChange={(e) => set("timeframe", e.target.value || null)} className={inputClass()} />
          </Field>

          <Field label="團隊組成" en="team">
            <input value={fields.team ?? ""} onChange={(e) => set("team", e.target.value || null)} className={inputClass()} />
          </Field>

          <Field label="客戶／業主" en="client">
            <input value={fields.client ?? ""} onChange={(e) => set("client", e.target.value || null)} className={inputClass()} />
          </Field>

          <Field label="外部連結／Demo 網址" en="external_url">
            <input value={fields.external_url ?? ""} onChange={(e) => set("external_url", e.target.value || null)} className={inputClass()} placeholder="https://" />
          </Field>

          <Field label="標籤" en="tags" hint="用逗號分隔，例如：UI/UX, 研究, 設計系統" className="md:col-span-2">
            <input value={tagsText} onChange={(e) => setTagsText(e.target.value)} className={inputClass()} />
          </Field>

          <Field
            label="頁尾版權文字"
            en="footer_copyright"
            hint="顯示在專案頁頁尾左下角；留空則自動帶入「© 年份 專案標題. All rights reserved.」"
            className="md:col-span-2"
          >
            <input
              value={fields.footer_copyright ?? ""}
              onChange={(e) => set("footer_copyright", e.target.value || null)}
              placeholder={`© ${new Date().getFullYear()} ${project.title}. All rights reserved.`}
              className={inputClass()}
            />
          </Field>
        </div>
      </Group>

      <Group id="group-publish" title="發佈設定" summary={`${statusSummary} · ${fields.is_visible ? "顯示在首頁" : "不顯示在首頁"} · 排序 ${fields.display_order}`} defaultOpen>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="發佈狀態" en="status" hint={STATUS_HELP[fields.status]}>
            <select value={fields.status} onChange={(e) => set("status", e.target.value as ProjectStatus)} className={inputClass()}>
              <option value="draft">草稿（draft）</option>
              <option value="published">已發佈（published）</option>
              <option value="archived">封存（archived）</option>
            </select>
          </Field>

          <Field label="排序" en="display_order" hint="數字越小越前面；也是首頁卡片的順序。用拖曳排序請到「總覽」">
            <input type="number" value={fields.display_order} onChange={(e) => set("display_order", Number(e.target.value))} className={inputClass()} />
          </Field>

          <div className="flex items-center gap-2 md:col-span-2">
            <input
              id="is_visible"
              type="checkbox"
              checked={fields.is_visible}
              onChange={(e) => set("is_visible", e.target.checked)}
              className="size-4 rounded border-admin-border accent-admin-accent"
            />
            <label htmlFor="is_visible" className="text-sm text-admin-text">
              顯示在首頁作品卡片區
              <span className="ml-2 font-mono text-[10px] text-admin-text-faint">is_visible</span>
            </label>
          </div>
        </div>
      </Group>

      <Group id="group-cover" title="首頁卡片｜封面圖" summary={fields.cover_image_url ? "已設定封面" : "尚未設定封面"} issue={coverIssue}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-sm font-medium text-admin-text">桌機封面</p>
            <AdminMediaDropzone
              value={fields.cover_image_url ?? ""}
              onChange={(v) => set("cover_image_url", v || null)}
              mediaPathPrefix={`${project.slug}/cover`}
              guide={COVER_DESKTOP_GUIDE}
            />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium text-admin-text">手機封面（選填）</p>
            <AdminMediaDropzone
              value={fields.cover_image_mobile ?? ""}
              onChange={(v) => set("cover_image_mobile", v || null)}
              mediaPathPrefix={`${project.slug}/cover-mobile`}
              guide={COVER_MOBILE_GUIDE}
            />
          </div>
        </div>

        {(fields.cover_image_url || fields.cover_image_mobile) && (
          <div className="mt-4 flex gap-3">
            {fields.cover_image_url && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] tracking-[0.1em] text-admin-text-faint">桌機卡片裁切預覽（4:3）</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={fields.cover_image_url} alt="" className="h-20 w-28 rounded-md border border-admin-border object-cover" />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] tracking-[0.1em] text-admin-text-faint">手機卡片裁切預覽（4:5）</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fields.cover_image_mobile || fields.cover_image_url || ""}
                alt=""
                className="h-24 w-20 rounded-md border border-admin-border object-cover"
              />
            </div>
          </div>
        )}

        <Field label="封面替代文字" en="cover_alt" hint="給視障使用者與搜尋引擎的圖片描述；有封面圖時必填，否則無法儲存" className="mt-5">
          <input
            value={fields.cover_alt ?? ""}
            onChange={(e) => set("cover_alt", e.target.value || null)}
            className={`${inputClass()} ${coverAltMissing ? "border-admin-danger" : ""}`}
            placeholder="例如：捷運 App 路線搜尋畫面的手機截圖"
          />
          {coverAltMissing && <p className="text-xs text-admin-danger">有封面圖時，這一欄為必填</p>}
        </Field>
      </Group>

      <Group id="group-card" title="首頁卡片｜樣式與文案" summary={`${CARD_SIZE_LABEL[fields.card_size]} · ${THEME_LABEL[fields.card_theme]}${fields.outcome ? ` · ${fields.outcome}` : ""}`}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="卡片大小" en="card_size" hint="首頁只能有一張「大卡」，下方預覽會提醒">
            <select value={fields.card_size} onChange={(e) => set("card_size", e.target.value as CardSize)} className={inputClass()}>
              {(Object.keys(CARD_SIZE_LABEL) as CardSize[]).map((v) => (
                <option key={v} value={v}>{CARD_SIZE_LABEL[v]}</option>
              ))}
            </select>
          </Field>

          <Field label="卡片主題色" en="card_theme">
            <select value={fields.card_theme} onChange={(e) => set("card_theme", e.target.value as CardTheme)} className={inputClass()}>
              {(Object.keys(THEME_LABEL) as CardTheme[]).map((v) => (
                <option key={v} value={v}>{THEME_LABEL[v]}</option>
              ))}
            </select>
          </Field>

          <Field label="卡片上顯示的標籤數" en="max_tags_on_card" hint="0–6，超過的標籤只在專案頁顯示">
            <input type="number" min={0} max={6} value={fields.max_tags_on_card} onChange={(e) => set("max_tags_on_card", Number(e.target.value))} className={inputClass()} />
          </Field>

          <Field label="年份" en="year">
            <input
              type="number"
              value={fields.year ?? ""}
              onChange={(e) => set("year", e.target.value === "" ? null : Number(e.target.value))}
              className={inputClass()}
            />
          </Field>

          <Field label="成果一句話" en="outcome" hint={`${fields.outcome?.length ?? 0}/${OUTCOME_MAX_CHARS} 字${outcomeTooLong ? " — 超過建議長度" : "；例如「+18%」「LIVE」"}`} className="md:col-span-2">
            <input
              value={fields.outcome ?? ""}
              onChange={(e) => set("outcome", e.target.value || null)}
              className={`${inputClass()} ${outcomeTooLong ? "border-admin-warning" : ""}`}
              maxLength={200}
            />
          </Field>

          <Field label="狀態標章" en="badge_status" hint="卡片角落的小標章">
            <select
              value={fields.badge_status ?? ""}
              onChange={(e) => set("badge_status", (e.target.value || null) as BadgeStatus | null)}
              className={inputClass()}
            >
              <option value="">（無）</option>
              {(Object.keys(BADGE_LABEL) as BadgeStatus[]).map((v) => (
                <option key={v} value={v}>{BADGE_LABEL[v]}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-admin-text">首頁版位預覽</p>
          <BentoPreviewMini projects={previewProjects} currentProjectId={project.id} />
        </div>
      </Group>

      <Group
        id="group-motion"
        title="首頁卡片｜裝飾與動態"
        summary={`${DECORATION_LABEL[fields.decoration]}${fields.hover_preview_video ? " · 有 Hover 預覽影片" : ""}`}
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="裝飾圖案" en="decoration">
            <select value={fields.decoration} onChange={(e) => set("decoration", e.target.value as Decoration)} className={inputClass()}>
              {(Object.keys(DECORATION_LABEL) as Decoration[]).map((v) => (
                <option key={v} value={v}>{DECORATION_LABEL[v]}</option>
              ))}
            </select>
          </Field>

          <Field label="裝飾位置" en="decoration_position">
            <select
              value={fields.decoration_position}
              onChange={(e) => set("decoration_position", e.target.value as DecorationPosition)}
              disabled={fields.decoration === "none"}
              className={`${inputClass()} ${fields.decoration === "none" ? "opacity-50" : ""}`}
            >
              {(Object.keys(POSITION_LABEL) as DecorationPosition[]).map((v) => (
                <option key={v} value={v}>{POSITION_LABEL[v]}</option>
              ))}
            </select>
          </Field>

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

          <Field label="進場傾斜角度" en="enter_rotation" hint="-8 到 8；留空＝依序自動左右交替">
            <input
              type="number"
              min={-8}
              max={8}
              value={fields.enter_rotation ?? ""}
              onChange={(e) => set("enter_rotation", e.target.value === "" ? null : Number(e.target.value))}
              className={inputClass()}
            />
          </Field>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-admin-text">
            Hover 預覽影片<span className="ml-2 text-xs font-normal text-admin-text-faint">選填</span>
          </p>
          <AdminMediaDropzone
            value={fields.hover_preview_video ?? ""}
            onChange={(v) => set("hover_preview_video", v || null)}
            mediaPathPrefix={`${project.slug}/hover-preview`}
            guide={HOVER_PREVIEW_GUIDE}
            warnIfOverBytes={HOVER_VIDEO_MAX_BYTES}
          />
        </div>
      </Group>
    </div>
  );
}
