/**
 * Shared `process.platforms` shape — used by Hero (overview), PlatformShowcase
 * (per-platform deep dive) and ThreeLayerArchitecture (system diagram), all of
 * which read the same `process.platforms` CMS array. Kept in one place so the
 * three sections can't drift into incompatible field sets.
 */
export interface YangbeiPlatform {
  id: string;
  name: string;
  label: string;
  color: string;
  url: string;
  auth: string;
  desc: string;
  features: string[];
  screenshot_url?: string;
}
