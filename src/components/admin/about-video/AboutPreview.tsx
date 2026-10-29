"use client";

import { useState } from "react";
import {
  DoodleEye,
  DoodlePlus,
  DoodleScribble,
  DoodleSpiral,
  DoodleSplat,
  DoodleStar,
} from "@/components/design-system/doodles";
import { displayNumber } from "@/lib/about-video";
import type { AboutIcon } from "@/lib/types";

export interface AboutPreviewData {
  statement: string;
  highlight_words: string[];
  intro: string;
  portrait_image: string | null;
  portrait_alt: string | null;
  resume_file: string | null;
  contact_link: string | null;
  show_tools_marquee: boolean;
  traits: { title: string; description: string; icon: AboutIcon }[];
  stats: { value: number; suffix: string | null; label: string }[];
  tools: { name: string }[];
}

function TraitIcon({ icon }: { icon: AboutIcon }) {
  const cls = "h-5 w-5";
  if (icon === "star") return <DoodleStar className={cls} />;
  if (icon === "plus") return <DoodlePlus className={cls} />;
  if (icon === "spiral") return <DoodleSpiral className={cls} strokeWidth={8} />;
  if (icon === "zigzag") return <DoodleScribble className={cls} strokeWidth={8} />;
  if (icon === "eye") return <DoodleEye className={cls} strokeWidth={8} />;
  return null;
}

/** Splits the statement into plain / highlighted runs (case-insensitive). */
function highlightRuns(statement: string, words: string[]) {
  const targets = words.map((w) => w.trim()).filter(Boolean);
  if (targets.length === 0) return [{ text: statement, hit: false }];
  const escaped = targets.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return statement
    .split(new RegExp(`(${escaped.join("|")})`, "gi"))
    .filter(Boolean)
    .map((text) => ({ text, hit: targets.some((t) => t.toUpperCase() === text.toUpperCase()) }));
}

/**
 * Schematic live preview of the homepage About block for the admin form --
 * same content, colors and structure as the Phase 3 design, not
 * pixel-identical. Desktop/Mobile switches the layout so long statements
 * or descriptions can be checked at phone width before saving.
 */
export function AboutPreview({ data }: { data: AboutPreviewData }) {
  const [mobile, setMobile] = useState(false);
  const runs = highlightRuns(data.statement, data.highlight_words);

  return (
    <div className="rounded-lg border border-admin-border bg-admin-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium tracking-[0.1em] text-admin-text-faint">即時預覽</span>
        <div className="flex gap-1">
          {(["DESKTOP", "MOBILE"] as const).map((label) => {
            const active = (label === "MOBILE") === mobile;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setMobile(label === "MOBILE")}
                className={`rounded-full px-2.5 py-1 text-[10px] font-medium tracking-wide transition-colors ${
                  active
                    ? "bg-admin-text text-white"
                    : "border border-admin-border text-admin-text-muted hover:border-admin-accent hover:text-admin-accent"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 overflow-x-auto rounded-md bg-admin-canvas p-3">
        <div
          className={`mx-auto bg-secondary-blue p-6 text-cream ${mobile ? "w-[375px]" : "w-full min-w-[720px]"}`}
        >
          <p className="font-nunito text-[10px] font-extrabold tracking-[0.25em]">02 / ABOUT</p>
          <div className={`mt-4 grid gap-6 ${mobile ? "grid-cols-1" : "grid-cols-12"}`}>
            <div className={mobile ? "" : "col-span-7"}>
              <p className={`font-fredoka uppercase leading-[1.05] ${mobile ? "text-[36px]" : "text-[44px]"}`}>
                {runs.map((r, i) =>
                  r.hit ? (
                    <span key={i} className="bg-primary-orange/80 px-1 box-decoration-clone">
                      {r.text}
                    </span>
                  ) : (
                    <span key={i}>{r.text}</span>
                  )
                )}
              </p>
              <p className="mt-4 whitespace-pre-line font-nunito text-sm leading-relaxed text-cream/90">
                {data.intro}
              </p>
            </div>
            <div className={`flex items-start justify-center ${mobile ? "" : "col-span-5"}`}>
              {data.portrait_image ? (
                <div className="relative w-3/5 -rotate-3">
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of an uploaded URL */}
                  <img
                    src={data.portrait_image}
                    alt={data.portrait_alt ?? ""}
                    className="aspect-[4/5] w-full rounded-[var(--radius-card)] object-cover"
                  />
                  <DoodleStar className="absolute -right-3 -top-3 h-10 w-10 text-primary-orange" />
                </div>
              ) : (
                <DoodleSplat className="w-1/2 text-cream" />
              )}
            </div>
          </div>

          {data.traits.length > 0 && (
            <div className={`mt-6 grid gap-3 ${mobile ? "grid-cols-1" : "grid-cols-3"}`}>
              {data.traits.map((t, i) => (
                <div key={i} className="rounded-[var(--radius-card)] bg-cream p-4 text-grey-900">
                  <div className="flex items-center justify-between text-secondary-blue">
                    <span className="font-fredoka text-3xl">{displayNumber(i)}</span>
                    <TraitIcon icon={t.icon} />
                  </div>
                  <p className="mt-2 font-fredoka text-lg">{t.title}</p>
                  <p className="mt-1 font-nunito text-sm leading-snug text-grey-700">{t.description}</p>
                </div>
              ))}
            </div>
          )}

          {data.stats.length > 0 && (
            <div className={`mt-6 grid gap-4 ${mobile ? "grid-cols-2" : "grid-cols-4"}`}>
              {data.stats.map((s, i) => (
                <div key={i}>
                  <p className="font-fredoka text-3xl">
                    {s.value}
                    {s.suffix}
                  </p>
                  <p className="font-nunito text-xs text-cream/85">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {data.show_tools_marquee && data.tools.length > 0 && (
            <p className="mt-6 overflow-hidden whitespace-nowrap font-nunito text-xs font-extrabold uppercase tracking-[0.2em]">
              {data.tools.map((t) => t.name).join("  ✦  ")}
            </p>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {data.resume_file && (
              <span className="rounded-full bg-cream px-5 py-2 font-nunito text-sm font-bold text-secondary-blue">
                下載履歷
              </span>
            )}
            {data.contact_link && (
              <span className="rounded-full border-2 border-cream px-5 py-2 font-nunito text-sm font-bold">聯絡我</span>
            )}
          </div>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-admin-text-faint">示意預覽，正式版面與動態在首頁改版後呈現。</p>
    </div>
  );
}
