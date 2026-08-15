export type Breakpoint = "desktop" | "tablet" | "mobile";

export const BREAKPOINTS: Breakpoint[] = ["desktop", "tablet", "mobile"];

export const CANVAS_WIDTH: Record<Breakpoint, number> = {
  desktop: 1400,
  tablet: 810,
  mobile: 390,
};

export type BlockKind =
  | "hero-tagline"
  | "hero-title"
  | "hero-subtitle"
  | "hero-meta"
  | "hero-tags"
  | "section";

export type TextAlign = "left" | "center" | "right";

/**
 * A single absolutely-positioned element on the canvas for one breakpoint.
 * Position/size is authored freely per breakpoint (no inheritance) -- the
 * editor is a true free-drag canvas, not a responsive-flow layout, per an
 * explicit product decision: each breakpoint is laid out independently.
 */
export interface LayoutBlock {
  id: string;
  kind: BlockKind;
  /** For kind === "section", the project_sections.id this block renders. */
  sectionId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  textAlign: TextAlign;
}

export interface PageLayout {
  desktop: LayoutBlock[];
  tablet: LayoutBlock[];
  mobile: LayoutBlock[];
}

export function emptyLayout(): PageLayout {
  return { desktop: [], tablet: [], mobile: [] };
}
