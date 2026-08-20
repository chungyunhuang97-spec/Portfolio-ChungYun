export type ProjectType = "case_study" | "side_project";
export type ProjectStatus = "draft" | "published" | "archived";

export interface Project {
  id: string;
  slug: string;
  title: string;
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
