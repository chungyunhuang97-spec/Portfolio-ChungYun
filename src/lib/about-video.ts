import type { AboutContent, AboutStat, AboutTrait, Video, VideoAspectRatio, VideoSourceType } from "@/lib/types";
import { extractYouTubeId, getYouTubeThumbnailUrl } from "@/lib/video";

/**
 * Limits + validation for the About / Video Works v2 tables, shared by the
 * admin forms (instant feedback) and the server actions (the real gate),
 * so the two can never disagree.
 */
export const ABOUT_STATEMENT_MAX = 80;
export const ABOUT_TRAIT_DESCRIPTION_MAX = 80;
export const ABOUT_STATS_MAX = 4;
export const PREVIEW_CLIP_MAX_BYTES = 2 * 1024 * 1024;

export const ABOUT_ICONS = ["star", "spiral", "eye", "zigzag", "plus", "none"] as const;
export const VIDEO_SOURCE_TYPES: VideoSourceType[] = ["instagram", "youtube", "vimeo", "mp4"];
export const VIDEO_ASPECT_RATIOS: VideoAspectRatio[] = ["9:16", "16:9", "1:1", "4:5"];

/** CSS `aspect-ratio` value for a stored ratio ("9:16" -> "9 / 16"). */
export function cssAspectRatio(ratio: VideoAspectRatio): string {
  return ratio.replace(":", " / ");
}

/** Two-digit display number from a 0-based position ("01", "02", ...). */
export function displayNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}

export interface ValidationResult {
  /** Block saving. */
  errors: string[];
  /** Shown, but saving is allowed. */
  warnings: string[];
}

export function highlightWordsMissing(statement: string, words: string[]): string[] {
  const upper = statement.toUpperCase();
  return words.filter((w) => w.trim() && !upper.includes(w.trim().toUpperCase()));
}

export function validateAboutContent(
  c: Pick<AboutContent, "statement" | "highlight_words" | "intro" | "portrait_image" | "portrait_alt">
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!c.statement.trim()) errors.push("宣言為必填");
  if (c.statement.length > ABOUT_STATEMENT_MAX) errors.push(`宣言不能超過 ${ABOUT_STATEMENT_MAX} 字元`);
  if (!c.intro.trim()) errors.push("介紹段落為必填");
  if (c.portrait_image && !c.portrait_alt?.trim()) errors.push("有人像照片時，替代文字為必填");
  const missing = highlightWordsMissing(c.statement, c.highlight_words);
  if (missing.length > 0) warnings.push(`這些螢光筆字詞不在宣言中：${missing.join("、")}`);
  return { errors, warnings };
}

export function validateAboutTraits(traits: Pick<AboutTrait, "title" | "description">[]): ValidationResult {
  const errors: string[] = [];
  traits.forEach((t, i) => {
    const n = displayNumber(i);
    if (!t.title.trim()) errors.push(`特質 ${n}：標題為必填`);
    if (!t.description.trim()) errors.push(`特質 ${n}：描述為必填`);
    if (t.description.length > ABOUT_TRAIT_DESCRIPTION_MAX)
      errors.push(`特質 ${n}：描述不能超過 ${ABOUT_TRAIT_DESCRIPTION_MAX} 字`);
  });
  return { errors, warnings: [] };
}

export function validateAboutStats(stats: Pick<AboutStat, "value" | "label">[]): ValidationResult {
  const errors: string[] = [];
  if (stats.length > ABOUT_STATS_MAX) errors.push(`數字列最多 ${ABOUT_STATS_MAX} 筆`);
  stats.forEach((s, i) => {
    if (!Number.isFinite(s.value)) errors.push(`數字 ${displayNumber(i)}：數值必須是整數`);
    if (!s.label.trim()) errors.push(`數字 ${displayNumber(i)}：說明為必填`);
  });
  return { errors, warnings: [] };
}

/** Infers source_type from a pasted URL (null when unrecognized). */
export function detectSourceType(url: string): VideoSourceType | null {
  if (/(youtube\.com|youtu\.be)/i.test(url)) return "youtube";
  if (/instagram\.com/i.test(url)) return "instagram";
  if (/vimeo\.com/i.test(url)) return "vimeo";
  if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)) return "mp4";
  return null;
}

/** YouTube's auto thumbnail for a URL (`hqdefault` always exists). */
export function youTubePosterFor(url: string): string | null {
  const id = extractYouTubeId(url) ?? url.match(/youtube\.com\/shorts\/([\w-]{6,})/i)?.[1] ?? null;
  return id ? getYouTubeThumbnailUrl(id, "hq") : null;
}

export type VideoFields = Omit<
  Video,
  "id" | "category_id" | "legacy_video_work_id" | "legacy_reel_link_id" | "created_at" | "updated_at"
>;

/** Applies to every admin create/edit. Migrated Instagram videos stay
 * visible without a poster until they're next edited. */
export function validateVideo(v: VideoFields): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!v.title.trim()) errors.push("標題為必填");
  if (v.source_type === "mp4" && !v.video_file) errors.push("來源是 mp4 時，必須上傳影片檔");
  if (v.source_type !== "mp4" && !v.source_url?.trim()) errors.push("請填入影片網址");
  if (v.poster_image && !v.poster_alt?.trim()) errors.push("有縮圖時，縮圖替代文字為必填");
  if (v.source_type === "instagram" && !v.poster_image && v.is_visible)
    errors.push("Instagram 影片必須先上傳縮圖，才能設為可見");
  if (v.source_type === "instagram" && !v.poster_image && !v.is_visible)
    warnings.push("Instagram 影片請上傳縮圖（建議 1080px 寬）");
  if (v.year !== null && (!Number.isInteger(v.year) || v.year < 1900 || v.year > 2100))
    errors.push("年份格式不正確");
  return { errors, warnings };
}

/* ------------------------------------------------------------------ */
/* Front-end helpers for the Video Works section                       */
/* ------------------------------------------------------------------ */

/** Width / height as a number ("16:9" -> 1.777...). */
export function aspectValue(ratio: VideoAspectRatio): number {
  const [w, h] = ratio.split(":").map(Number);
  return w / h;
}

/**
 * Poster fallback chain (steps 1-2; step 3 is the mp4 frame, step 4 the
 * poster card -- both rendered by the caller when this returns null):
 * uploaded poster_image, then YouTube's auto thumbnail.
 */
export function resolvePoster(v: Pick<Video, "poster_image" | "source_type" | "source_url">): string | null {
  if (v.poster_image) return v.poster_image;
  if (v.source_type === "youtube" && v.source_url) return youTubePosterFor(v.source_url);
  return null;
}

/** Muted autoplay embed URL for the inline player (null = not embeddable). */
export function playerEmbedUrl(v: Pick<Video, "source_type" | "source_url">): string | null {
  const url = v.source_url;
  if (!url) return null;
  if (v.source_type === "youtube") {
    const id = extractYouTubeId(url) ?? url.match(/youtube\.com\/shorts\/([\w-]{6,})/i)?.[1];
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&playsinline=1&rel=0` : null;
  }
  if (v.source_type === "vimeo") {
    const id = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i)?.[1];
    return id ? `https://player.vimeo.com/video/${id}?autoplay=1&muted=1` : null;
  }
  if (v.source_type === "instagram") {
    const m = url.match(/instagram\.com\/(?:[^/]+\/)?(p|reel|reels)\/([\w-]+)/i);
    if (!m) return null;
    const type = m[1].toLowerCase() === "reels" ? "reel" : m[1].toLowerCase();
    return `https://www.instagram.com/${type}/${m[2]}/embed`;
  }
  return null;
}

/** site_content keys the homepage no longer reads since the About v2
 * migration, mapped to the admin page that replaced them. */
export const LEGACY_SITE_CONTENT: Record<string, { href: string; label: string }> = {
  about_me: { href: "/admin/about", label: "關於我" },
  positioning_tags: { href: "/admin/about", label: "關於我" },
};
