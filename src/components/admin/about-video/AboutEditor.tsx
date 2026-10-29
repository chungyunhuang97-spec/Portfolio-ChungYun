"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash } from "@phosphor-icons/react";
import { AdminMediaDropzone } from "@/components/admin/AdminMediaDropzone";
import {
  ABOUT_ICONS,
  ABOUT_STATEMENT_MAX,
  ABOUT_STATS_MAX,
  ABOUT_TRAIT_DESCRIPTION_MAX,
  displayNumber,
  validateAboutContent,
  validateAboutStats,
  validateAboutTraits,
} from "@/lib/about-video";
import {
  saveAboutStats,
  saveAboutTools,
  saveAboutTraits,
  updateAboutContent,
} from "@/lib/about-video-actions";
import type { AboutAdminData } from "@/lib/admin-data";
import type { AboutContent, AboutIcon } from "@/lib/types";
import { AboutPreview } from "./AboutPreview";
import {
  CharCount,
  Field,
  Messages,
  SaveButton,
  SectionHeading,
  Toggle,
  inputClass,
  inputClassW,
  type SaveStatus,
} from "./ui";

type TraitRow = { id?: string; title: string; description: string; icon: AboutIcon };
type StatRow = { id?: string; value: number; suffix: string | null; label: string };
type ToolRow = { id?: string; name: string };

const ICON_LABEL: Record<AboutIcon, string> = {
  star: "星星",
  spiral: "螺旋",
  eye: "眼睛",
  zigzag: "鋸齒",
  plus: "加號",
  none: "無",
};

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function RowControls({
  index,
  count,
  onMove,
  onRemove,
}: {
  index: number;
  count: number;
  onMove: (to: number) => void;
  onRemove: () => void;
}) {
  const btn = "flex h-8 w-8 items-center justify-center rounded-md text-admin-text-faint hover:bg-admin-surface-hover hover:text-admin-text disabled:opacity-30";
  return (
    <div className="flex shrink-0 items-center">
      <button type="button" className={btn} disabled={index === 0} onClick={() => onMove(index - 1)} aria-label="上移">
        <ArrowUp size={14} />
      </button>
      <button type="button" className={btn} disabled={index === count - 1} onClick={() => onMove(index + 1)} aria-label="下移">
        <ArrowDown size={14} />
      </button>
      <button type="button" className={`${btn} hover:text-admin-danger`} onClick={onRemove} aria-label="刪除">
        <Trash size={14} />
      </button>
    </div>
  );
}

/**
 * Admin editor for the homepage About block: the single-row about_content
 * plus the ordered traits / stats / tools lists, with a live preview fed
 * by the unsaved state. One save writes all four, validated with the same
 * rules the server actions enforce (lib/about-video.ts).
 */
export function AboutEditor({ data }: { data: AboutAdminData & { content: AboutContent } }) {
  const c = data.content;
  const [statement, setStatement] = useState(c.statement);
  const [highlightText, setHighlightText] = useState(c.highlight_words.join(", "));
  const [intro, setIntro] = useState(c.intro);
  const [portraitImage, setPortraitImage] = useState(c.portrait_image ?? "");
  const [portraitAlt, setPortraitAlt] = useState(c.portrait_alt ?? "");
  const [resumeFile, setResumeFile] = useState(c.resume_file ?? "");
  const [contactLink, setContactLink] = useState(c.contact_link ?? "");
  const [showMarquee, setShowMarquee] = useState(c.show_tools_marquee);
  const [traits, setTraits] = useState<TraitRow[]>(
    data.traits.map(({ id, title, description, icon }) => ({ id, title, description, icon }))
  );
  const [stats, setStats] = useState<StatRow[]>(
    data.stats.map(({ id, value, suffix, label }) => ({ id, value, suffix, label }))
  );
  const [tools, setTools] = useState<ToolRow[]>(data.tools.map(({ id, name }) => ({ id, name })));
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const highlightWords = useMemo(
    () => highlightText.split(",").map((w) => w.trim()).filter(Boolean),
    [highlightText]
  );

  const contentFields = {
    statement,
    highlight_words: highlightWords,
    intro,
    portrait_image: portraitImage || null,
    portrait_alt: portraitAlt.trim() || null,
    resume_file: resumeFile || null,
    contact_link: contactLink.trim() || null,
    show_tools_marquee: showMarquee,
  };

  const contentCheck = validateAboutContent(contentFields);
  const traitsCheck = validateAboutTraits(traits);
  const statsCheck = validateAboutStats(stats);
  const errors = [...contentCheck.errors, ...traitsCheck.errors, ...statsCheck.errors];
  const warnings = contentCheck.warnings;

  async function handleSave() {
    if (errors.length > 0) return;
    setStatus("saving");
    setSaveError(null);
    const results = [
      await updateAboutContent(contentFields),
      await saveAboutTraits(traits),
      await saveAboutStats(stats),
      await saveAboutTools(tools),
    ];
    const failed = results.find((r) => !r.success);
    if (failed && !failed.success) {
      setStatus("error");
      setSaveError(failed.error);
      return;
    }
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2000);
  }

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-10">
        {/* --- Statement + intro --- */}
        <section className="space-y-5">
          <SectionHeading>宣言與介紹</SectionHeading>
          <Field label="STATEMENT 宣言" hint={<CharCount value={statement} max={ABOUT_STATEMENT_MAX} />}>
            <textarea rows={2} value={statement} onChange={(e) => setStatement(e.target.value)} className={inputClass} />
          </Field>
          <Field label="HIGHLIGHT WORDS 螢光筆字詞（逗號分隔，必須出現在宣言中）">
            <input value={highlightText} onChange={(e) => setHighlightText(e.target.value)} className={inputClass} />
          </Field>
          <Field label="INTRO 介紹段落">
            <textarea rows={5} value={intro} onChange={(e) => setIntro(e.target.value)} className={inputClass} />
          </Field>
        </section>

        {/* --- Portrait / resume / contact --- */}
        <section className="space-y-5">
          <SectionHeading>照片、履歷與聯絡</SectionHeading>
          <Field label="PORTRAIT 人像照片" hint="沒有照片時，首頁這一欄會改放大型手繪裝飾">
            <AdminMediaDropzone
              value={portraitImage}
              onChange={setPortraitImage}
              mediaPathPrefix="about/portrait"
              accept="image/*"
            />
          </Field>
          <Field
            label="PORTRAIT ALT 替代文字"
            error={portraitImage && !portraitAlt.trim() ? "有人像照片時為必填" : null}
          >
            <input value={portraitAlt} onChange={(e) => setPortraitAlt(e.target.value)} className={inputClass} />
          </Field>
          <Field label="RESUME 履歷 PDF" hint="沒有上傳時，「下載履歷」按鈕不顯示">
            <AdminMediaDropzone
              value={resumeFile}
              onChange={setResumeFile}
              mediaPathPrefix="about/resume"
              accept="application/pdf"
              compact
            />
          </Field>
          <Field label="CONTACT LINK 聯絡連結" hint="例：mailto:you@example.com；留空則不顯示「聯絡我」">
            <input value={contactLink} onChange={(e) => setContactLink(e.target.value)} className={inputClass} />
          </Field>
        </section>

        {/* --- Traits --- */}
        <section className="space-y-3">
          <SectionHeading
            action={
              <button
                type="button"
                onClick={() => setTraits([...traits, { title: "", description: "", icon: "none" }])}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-admin-accent hover:underline"
              >
                <Plus size={14} weight="bold" />
                新增特質
              </button>
            }
          >
            特質卡片（描述完整顯示，上限 {ABOUT_TRAIT_DESCRIPTION_MAX} 字）
          </SectionHeading>
          {traits.map((t, i) => (
            <div key={t.id ?? `new-${i}`} className="space-y-2 rounded-lg border border-admin-border bg-admin-surface p-3">
              <div className="flex items-center gap-2">
                <span className="w-8 shrink-0 font-mono text-xs text-admin-text-faint">{displayNumber(i)}</span>
                <input
                  value={t.title}
                  placeholder="標題，例：System Thinker"
                  onChange={(e) => setTraits(traits.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
                  className={inputClass}
                />
                <select
                  value={t.icon}
                  onChange={(e) =>
                    setTraits(traits.map((x, j) => (j === i ? { ...x, icon: e.target.value as AboutIcon } : x)))
                  }
                  className={inputClassW("w-28")}
                  aria-label="小圖示"
                >
                  {ABOUT_ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {ICON_LABEL[icon]}
                    </option>
                  ))}
                </select>
                <RowControls
                  index={i}
                  count={traits.length}
                  onMove={(to) => setTraits(move(traits, i, to))}
                  onRemove={() => setTraits(traits.filter((_, j) => j !== i))}
                />
              </div>
              <textarea
                rows={2}
                value={t.description}
                placeholder="完整描述"
                onChange={(e) =>
                  setTraits(traits.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))
                }
                className={inputClass}
              />
              <p className="text-xs">
                <CharCount value={t.description} max={ABOUT_TRAIT_DESCRIPTION_MAX} />
              </p>
            </div>
          ))}
        </section>

        {/* --- Stats --- */}
        <section className="space-y-3">
          <SectionHeading
            action={
              stats.length < ABOUT_STATS_MAX && (
                <button
                  type="button"
                  onClick={() => setStats([...stats, { value: 0, suffix: "+", label: "" }])}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-admin-accent hover:underline"
                >
                  <Plus size={14} weight="bold" />
                  新增數字
                </button>
              )
            }
          >
            數字列（選填，最多 {ABOUT_STATS_MAX} 筆，沒設定時整列不顯示）
          </SectionHeading>
          {stats.map((s, i) => (
            <div key={s.id ?? `new-${i}`} className="flex items-center gap-2">
              <input
                type="number"
                value={Number.isFinite(s.value) ? s.value : ""}
                onChange={(e) =>
                  setStats(stats.map((x, j) => (j === i ? { ...x, value: parseInt(e.target.value, 10) } : x)))
                }
                className={inputClassW("w-24")}
                aria-label="數值"
              />
              <input
                value={s.suffix ?? ""}
                placeholder="+"
                onChange={(e) =>
                  setStats(stats.map((x, j) => (j === i ? { ...x, suffix: e.target.value || null } : x)))
                }
                className={inputClassW("w-20")}
                aria-label="後綴"
              />
              <input
                value={s.label}
                placeholder="說明，例：年產品設計經驗"
                onChange={(e) => setStats(stats.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                className={inputClass}
                aria-label="說明"
              />
              <RowControls
                index={i}
                count={stats.length}
                onMove={(to) => setStats(move(stats, i, to))}
                onRemove={() => setStats(stats.filter((_, j) => j !== i))}
              />
            </div>
          ))}
        </section>

        {/* --- Tools --- */}
        <section className="space-y-3">
          <SectionHeading
            action={
              <button
                type="button"
                onClick={() => setTools([...tools, { name: "" }])}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-admin-accent hover:underline"
              >
                <Plus size={14} weight="bold" />
                新增工具
              </button>
            }
          >
            工具跑馬燈
          </SectionHeading>
          <Toggle checked={showMarquee} onChange={setShowMarquee} label="在首頁顯示工具跑馬燈" />
          {tools.map((t, i) => (
            <div key={t.id ?? `new-${i}`} className="flex items-center gap-2">
              <input
                value={t.name}
                placeholder="例：Figma"
                onChange={(e) => setTools(tools.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                className={inputClass}
                aria-label="工具名稱"
              />
              <RowControls
                index={i}
                count={tools.length}
                onMove={(to) => setTools(move(tools, i, to))}
                onRemove={() => setTools(tools.filter((_, j) => j !== i))}
              />
            </div>
          ))}
        </section>

        <div className="sticky bottom-0 space-y-3 border-t border-admin-border bg-admin-bg py-4">
          <Messages errors={errors} warnings={warnings} />
          <SaveButton status={status} disabled={errors.length > 0} onClick={handleSave} error={saveError} />
        </div>
      </div>

      <div className="xl:sticky xl:top-6 xl:self-start">
        <AboutPreview data={{ ...contentFields, traits, stats, tools }} />
      </div>
    </div>
  );
}
