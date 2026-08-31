export type CanvasPresetId = "ig-post" | "ig-story" | "square" | "custom";

export interface CanvasPreset {
  id: CanvasPresetId;
  label: string;
  sublabel: string;
  width: number;
  height: number;
}

export type FontOptionId = "sans" | "display" | "serif" | "mono";

export interface FontOption {
  id: FontOptionId;
  label: string;
  cssVar: string;
  fallback: string;
}

export type BracketStyleId = "round-small" | "round-ascii" | "square" | "none";

export interface BracketOption {
  id: BracketStyleId;
  label: string;
  open: string;
  close: string;
}

/** A single draggable "cutout window" — position is stored as a percentage
 * of the photo's rendered box so it stays correct across canvas sizes. */
export interface Cutout {
  id: string;
  /** top-left corner, 0-100, percentage of the photo box */
  xPct: number;
  yPct: number;
}

/** One token in the flowed caption: either a plain word or a cutout marker
 * referencing a Cutout by id. */
export type CaptionToken = { kind: "word"; text: string } | { kind: "cutout"; cutoutId: string };
