import type { SVGProps } from "react";

/**
 * Hand-drawn doodle marks local to this project, matching the site-wide
 * hand-drawn aesthetic (components/design-system/doodles.tsx) but kept
 * here rather than in that shared file since they're this page's own
 * signature motif, not meant to be reused by another case study (same
 * convention tct/_sections/Context.tsx follows with its own local
 * DoodleTornPaper/DoodleEnlargedTarget).
 */

/** Dashed heart-shaped stitch line — stands in for "一條隱藏的脈絡" (the
 * hidden thread connecting all four touchpoints) in DesignThread.tsx. */
export function DoodleHeartStitch(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 40" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeDasharray="1 7" {...props}>
      <path d="M4 20 C20 2 40 2 48 14 C56 2 76 2 92 14 C100 6 112 10 116 20" />
    </svg>
  );
}
