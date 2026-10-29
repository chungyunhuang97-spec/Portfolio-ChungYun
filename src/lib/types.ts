export type ProjectType = "case_study" | "side_project";
export type ProjectStatus = "draft" | "published" | "archived";

/** Homepage Bento grid cell size -- see docs/case-study-design-conventions.md
 * for the grid's column-span rules per breakpoint. */
export type CardSize = "large" | "wide" | "small";
export type CardTheme = "cream" | "blue" | "red" | "white";
/** Bento card status pill -- distinct from ProjectStatus (draft/published/
 * archived), which controls publish visibility, not the on-card badge. */
export type BadgeStatus = "shipped" | "live" | "demo" | "concept";
export type Decoration = "star" | "spiral" | "eye" | "zigzag" | "plus" | "none";
export type DecorationPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface Project {
  id: string;
  slug: string;
  title: string;
  /** Optional English subtitle shown under the (Chinese) title on the
   * homepage Bento card only. */
  title_en: string | null;
  subtitle: string | null;
  tagline: string | null;
  category: string | null;
  role: string | null;
  timeframe: string | null;
  team: string | null;
  client: string | null;
  external_url: string | null;
  project_type: ProjectType;
  status: ProjectStatus;
  display_order: number;
  cover_image_url: string | null;
  tags: string[];
  internal_note: string | null;
  /** Left-hand copyright line rendered by the shared <Footer /> component
   * (design-system/Footer.tsx). Per-project so every case-study page that
   * reuses Footer can carry its own copyright text, edited from this same
   * DETAILS form (see ProjectMetaForm.tsx). Nullable -- pages fall back to
   * a generic "© {year} {title}. All rights reserved." when unset. */
  footer_copyright: string | null;

  /* --- Bento grid (homepage Projects section) fields --- */
  /** Whether this project appears in the homepage Bento grid, independent
   * of `status` (which governs /work/[slug] reachability). */
  is_visible: boolean;
  card_size: CardSize;
  card_theme: CardTheme;
  /** Mobile-cropped cover; falls back to cover_image_url when unset. */
  cover_image_mobile: string | null;
  /** Required (enforced in the admin form, not the DB) whenever
   * cover_image_url is set. */
  cover_alt: string | null;
  /** One-line result shown on the card, e.g. "+18%" or "LIVE" (<=60 chars). */
  outcome: string | null;
  year: number | null;
  badge_status: BadgeStatus | null;
  decoration: Decoration;
  decoration_position: DecorationPosition;
  animate_decoration: boolean;
  /** Overrides the entrance animation's initial rotation (-8..8); null
   * falls back to an index-based alternating default. */
  enter_rotation: number | null;
  /** Muted/looped preview clip shown on hover on pointer-fine devices only. */
  hover_preview_video: string | null;
  max_tags_on_card: number;
}

export interface ProjectGridSettings {
  enable_scroll_choreography: boolean;
  decor_cell_label: string;
  decor_cell_link: string;
}

export type SectionType =
  | "hero"
  | "overview"
  | "challenge"
  | "role"
  | "process"
  | "outcome"
  | "reflection";

export interface ProjectSection {
  id: string;
  project_id: string;
  section_type: SectionType;
  content: Record<string, unknown>;
  display_order: number;
}

export interface SiteContent {
  key: string;
  content: Record<string, unknown>;
}

export type VideoWorkType = "featured" | "more";
export type VideoEmbedType = "youtube" | "link";

export interface VideoWork {
  id: string;
  type: VideoWorkType;
  title: string;
  subtitle: string | null;
  description: string | null;
  role_items: string[] | null;
  tags: string[];
  thumbnail_url: string | null;
  video_url: string | null;
  embed_type: VideoEmbedType | null;
  brief_image_url: string | null;
  /** Free-text badge the admin sets per work, e.g. "基礎剪輯" / "進階剪輯". */
  level_label: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ReelLink {
  id: string;
  video_work_id: string;
  label: string;
  url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface VideoSectionSettings {
  id: string;
  is_visible: boolean;
  updated_at: string;
}

/* --- About v2 (about_content / about_traits / about_stats / about_tools) --- */

export type AboutIcon = "star" | "spiral" | "eye" | "zigzag" | "plus" | "none";

/** Single-row settings table (id is always `true`). */
export interface AboutContent {
  id: true;
  statement: string;
  /** Words to give the highlighter stroke; must appear in `statement`. */
  highlight_words: string[];
  intro: string;
  portrait_image: string | null;
  /** Required whenever portrait_image is set (DB constraint). */
  portrait_alt: string | null;
  resume_file: string | null;
  contact_link: string | null;
  show_tools_marquee: boolean;
  updated_at: string;
}

export interface AboutTrait {
  id: string;
  title: string;
  /** Shown in full on the front end -- the admin caps it at 80 chars. */
  description: string;
  icon: AboutIcon;
  sort_order: number;
}

export interface AboutStat {
  id: string;
  value: number;
  suffix: string | null;
  label: string;
  sort_order: number;
}

export interface AboutTool {
  id: string;
  name: string;
  sort_order: number;
}

/* --- Video Works v2 (video_categories / videos), replacing video_works +
   reel_links. The legacy_* columns only trace the one-off data migration. --- */

export type VideoSourceType = "instagram" | "youtube" | "vimeo" | "mp4";
export type VideoAspectRatio = "9:16" | "16:9" | "1:1" | "4:5";

export interface VideoCategory {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  /** Display number (01, 02, ...) is derived from this order, not stored. */
  sort_order: number;
  is_visible: boolean;
  /** Small badge next to the category name, e.g. "進階剪輯". */
  level_label: string | null;
  /** "企劃截圖" thumbnail in the info column, opens in a lightbox. */
  brief_image_url: string | null;
  tags: string[];
  /** Outbound account link ("查看完整帳號"), carried over from video_works. */
  profile_url: string | null;
  legacy_video_work_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  category_id: string;
  title: string;
  source_type: VideoSourceType;
  /** Required unless source_type is "mp4". */
  source_url: string | null;
  /** Required when source_type is "mp4". */
  video_file: string | null;
  poster_image: string | null;
  /** Required whenever poster_image is set (DB constraint). */
  poster_alt: string | null;
  /** Second of the mp4 the admin grabs as the poster frame. */
  poster_time: number | null;
  /** Muted looping 3-6s preview (<=2MB) for the selected card. */
  preview_clip: string | null;
  aspect_ratio: VideoAspectRatio;
  duration: string | null;
  roles: string[];
  client: string | null;
  year: number | null;
  captions_url: string | null;
  /** Category's default selection; at most one per category (unique index). */
  is_featured: boolean;
  sort_order: number;
  is_visible: boolean;
  legacy_video_work_id: string | null;
  legacy_reel_link_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface VideoCategoryWithVideos extends VideoCategory {
  videos: Video[];
}
