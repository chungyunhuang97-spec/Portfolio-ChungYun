import { supabase } from "@/lib/supabase/client";
import type { ProjectSection } from "@/lib/types";
import {
  type Breakpoint,
  type LayoutBlock,
  type PageLayout,
  CANVAS_WIDTH,
  emptyLayout,
} from "@/lib/layout-types";

export async function getPageLayout(slug: string): Promise<PageLayout | null> {
  const { data, error } = await supabase
    .from("page_layouts")
    .select("layout")
    .eq("page_slug", slug)
    .eq("page_type", "project")
    .maybeSingle<{ layout: PageLayout }>();

  if (error) {
    console.error(`Failed to load page_layouts for "${slug}":`, error.message);
    return null;
  }

  if (!data) return null;

  // Defensive defaults in case a breakpoint key is missing from older rows.
  return {
    desktop: data.layout.desktop ?? [],
    tablet: data.layout.tablet ?? [],
    mobile: data.layout.mobile ?? [],
  };
}

/**
 * Builds a reasonable starting layout from the existing hero fields + section
 * list, so opening the canvas editor for the first time on a page that has
 * no page_layouts row yet starts from a sane vertical stack instead of a
 * blank canvas. Each breakpoint is generated independently (no inheritance),
 * matching the "true free-drag, no automatic responsive behavior" decision.
 */
export function buildDefaultLayout(
  heroHasTagline: boolean,
  heroHasSubtitle: boolean,
  sections: ProjectSection[]
): PageLayout {
  const result = emptyLayout();
  (Object.keys(result) as Breakpoint[]).forEach((bp) => {
    result[bp] = buildDefaultBlocksForBreakpoint(bp, heroHasTagline, heroHasSubtitle, sections);
  });
  return result;
}

function buildDefaultBlocksForBreakpoint(
  bp: Breakpoint,
  heroHasTagline: boolean,
  heroHasSubtitle: boolean,
  sections: ProjectSection[]
): LayoutBlock[] {
  const canvasWidth = CANVAS_WIDTH[bp];
  const margin = bp === "desktop" ? 200 : bp === "tablet" ? 60 : 24;
  const contentWidth = canvasWidth - margin * 2;
  const blocks: LayoutBlock[] = [];
  let y = bp === "desktop" ? 60 : 40;
  let z = 1;

  if (heroHasTagline) {
    blocks.push({
      id: "hero-tagline",
      kind: "hero-tagline",
      x: margin,
      y,
      width: contentWidth,
      height: 24,
      zIndex: z++,
      textAlign: "left",
    });
    y += 24 + 16;
  }

  blocks.push({
    id: "hero-title",
    kind: "hero-title",
    x: margin,
    y,
    width: contentWidth,
    height: bp === "mobile" ? 120 : 90,
    zIndex: z++,
    textAlign: "left",
  });
  y += (bp === "mobile" ? 120 : 90) + 24;

  if (heroHasSubtitle) {
    blocks.push({
      id: "hero-subtitle",
      kind: "hero-subtitle",
      x: margin,
      y,
      width: Math.min(contentWidth, 680),
      height: 80,
      zIndex: z++,
      textAlign: "left",
    });
    y += 80 + 24;
  }

  blocks.push({
    id: "hero-meta",
    kind: "hero-meta",
    x: margin,
    y,
    width: contentWidth,
    height: 28,
    zIndex: z++,
    textAlign: "left",
  });
  y += 28 + 48;

  for (const section of sections) {
    if (section.section_type === "hero") continue;
    blocks.push({
      id: `section-${section.id}`,
      kind: "section",
      sectionId: section.id,
      x: margin,
      y,
      width: contentWidth,
      height: 200,
      zIndex: z++,
      textAlign: "left",
    });
    y += 200 + 40;
  }

  return blocks;
}
