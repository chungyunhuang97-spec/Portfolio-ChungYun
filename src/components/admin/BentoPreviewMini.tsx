"use client";

import { useState } from "react";
import type { CardSize, CardTheme } from "@/lib/types";

export interface BentoPreviewProject {
  id: string;
  slug: string;
  title: string;
  card_size: CardSize;
  is_visible: boolean;
  card_theme: CardTheme;
}

type Viewport = "desktop" | "tablet" | "mobile";

const VIEWPORTS: { key: Viewport; label: string }[] = [
  { key: "desktop", label: "DESKTOP" },
  { key: "tablet", label: "TABLET" },
  { key: "mobile", label: "MOBILE" },
];

const THEME_SWATCH: Record<CardTheme, string> = {
  cream: "bg-cream text-grey-800 border border-grey-100",
  blue: "bg-secondary-blue text-cream",
  red: "bg-primary-orange text-cream",
  white: "bg-proj-white text-grey-800 border border-grey-100",
};

/** Column span for one visible project card, matching the real homepage
 * Bento grid's rules (see docs/case-study-design-conventions.md) -- kept
 * in sync by hand since this preview and the real grid are built at
 * different times (Phase 1 admin form vs. Phase 2 homepage). */
function spanClasses(size: CardSize, viewport: Viewport): string {
  if (viewport === "mobile") return "col-span-1";
  if (viewport === "tablet") {
    return size === "small" ? "col-span-3" : "col-span-6";
  }
  // desktop (12-col)
  if (size === "large") return "col-span-6 row-span-2";
  if (size === "wide") return "col-span-6";
  return "col-span-3";
}

function gridColsClass(viewport: Viewport): string {
  if (viewport === "mobile") return "grid-cols-1";
  if (viewport === "tablet") return "grid-cols-6";
  return "grid-cols-12";
}

/**
 * Schematic (not pixel-accurate) live preview of where a project's card
 * will land in the homepage Bento grid, so editing card_size/card_theme/
 * is_visible in the admin form shows an immediate "where does this go"
 * picture instead of making Joe imagine the grid math. Takes the full
 * visible-project list (with the currently-edited project's pending field
 * values already merged in by the caller) rather than fetching its own
 * data, so it always reflects unsaved edits.
 */
export function BentoPreviewMini({
  projects,
  currentProjectId,
}: {
  projects: BentoPreviewProject[];
  currentProjectId: string;
}) {
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const visible = projects.filter((p) => p.is_visible);
  const largeCount = visible.filter((p) => p.card_size === "large").length;

  return (
    <div className="rounded-lg border border-admin-border bg-admin-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium tracking-[0.1em] text-admin-text-faint">
          BENTO 預覽
        </span>
        <div className="flex gap-1">
          {VIEWPORTS.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => setViewport(v.key)}
              className={`rounded-full px-2.5 py-1 text-[10px] font-medium tracking-wide transition-colors ${
                viewport === v.key
                  ? "bg-admin-text text-white"
                  : "border border-admin-border text-admin-text-muted hover:border-admin-accent hover:text-admin-accent"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {largeCount > 1 && (
        <p className="mt-2 text-xs text-admin-warning">
          目前有 {largeCount} 個可見專案設為 large，建議最多 1 個
        </p>
      )}

      <div className={`mt-3 grid auto-rows-[40px] gap-1.5 ${gridColsClass(viewport)}`}>
        {visible.map((p) => (
          <div
            key={p.id}
            className={`flex items-center justify-center rounded-md px-1 text-center text-[10px] font-medium leading-tight ${spanClasses(
              p.card_size,
              viewport
            )} ${THEME_SWATCH[p.card_theme]} ${
              p.id === currentProjectId ? "ring-2 ring-admin-accent ring-offset-1" : ""
            }`}
            title={p.title}
          >
            <span className="truncate">{p.title}</span>
          </div>
        ))}
        {/* DECOR cell -- always last, fixed span, not part of `projects` */}
        <div
          className={`flex items-center justify-center rounded-md border border-dashed border-admin-border-strong text-[10px] text-admin-text-faint ${
            viewport === "mobile" ? "col-span-1" : viewport === "tablet" ? "col-span-6" : "col-span-3"
          }`}
        >
          DECOR
        </div>
      </div>

      <p className="mt-2 text-[11px] text-admin-text-faint">示意圖，非實際像素比例。</p>
    </div>
  );
}
