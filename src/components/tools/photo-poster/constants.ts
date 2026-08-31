import type { BracketOption, CanvasPreset, FontOption } from "./types";

export const CANVAS_PRESETS: CanvasPreset[] = [
  { id: "ig-post", label: "IG 貼文", sublabel: "1080 × 1350 · 4:5", width: 1080, height: 1350 },
  { id: "ig-story", label: "IG 限時動態 / Reels", sublabel: "1080 × 1920 · 9:16", width: 1080, height: 1920 },
  { id: "square", label: "正方形貼文", sublabel: "1080 × 1080 · 1:1", width: 1080, height: 1080 },
  { id: "custom", label: "自訂尺寸", sublabel: "輸入你要的寬高", width: 1080, height: 1350 },
];

export const FONT_OPTIONS: FontOption[] = [
  { id: "sans", label: "Sans（無襯線 · 預設）", cssVar: "var(--font-geist-sans)", fallback: "sans-serif" },
  { id: "display", label: "Display（標題感）", cssVar: "var(--font-outfit)", fallback: "sans-serif" },
  { id: "serif", label: "Serif（詩意襯線）", cssVar: "var(--font-newsreader)", fallback: "serif" },
  { id: "mono", label: "Mono（打字機）", cssVar: "var(--font-geist-mono)", fallback: "monospace" },
];

export const BRACKET_OPTIONS: BracketOption[] = [
  { id: "round-small", label: "（小圖）全形括號", open: "（", close: "）" },
  { id: "round-ascii", label: "(小圖) 半形括號", open: "(", close: ")" },
  { id: "square", label: "【小圖】方括號", open: "【", close: "】" },
  { id: "none", label: "無括號", open: "", close: "" },
];

// --- Local poetic-caption generator -----------------------------------
// Stand-in for the "Gemini AI 重新生成" button in the reference tool.
// This project doesn't wire up a live Gemini API key, so captions are
// assembled from a small template + word-bank pool instead. Swap the body
// of `generatePoeticCaption` for a real API call (e.g. a /api/caption
// route) later without touching any caller.

const SUBJECTS = ["Warm lanterns", "Quiet mornings", "Slow rivers", "City lights", "Autumn leaves", "Ocean waves"];
const VERBS = ["glow like", "drift like", "shimmer like", "settle like", "burn like", "fade like"];
const OBJECTS = [
  "luminous jewels",
  "scattered stars",
  "half-remembered dreams",
  "flickering candles",
  "distant fireflies",
  "melting gold",
];
const SETTINGS = [
  "against the deep indigo of a twilight sky",
  "beneath a sky still holding onto daylight",
  "over streets that never quite go quiet",
  "through the hush of an early winter morning",
  "along a horizon that keeps rewriting itself",
  "inside a moment too soft to name",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generatePoeticCaption(): string {
  return `${pick(SUBJECTS)} ${pick(VERBS)} ${pick(OBJECTS)} ${pick(SETTINGS)}.`;
}
