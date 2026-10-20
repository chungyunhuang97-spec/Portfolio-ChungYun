import type { SVGProps } from "react";

/**
 * Hand-drawn doodle marks local to this project, matching the site-wide
 * hand-drawn aesthetic (components/design-system/doodles.tsx) but kept
 * here rather than in that shared file since they're this page's own
 * signature motif, not meant to be reused by another case study (same
 * convention tct/_sections/Context.tsx follows with its own local
 * DoodleTornPaper/DoodleEnlargedTarget).
 *
 * No real photography exists for this project yet (materials are still
 * being finalized), so these stand in for Hero's visual instead of an
 * empty MockupSlot — an intentional illustration rather than a blank box.
 */

/** Two interlocking wedding rings. */
export function DoodleRings(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" {...props}>
      <circle cx="46" cy="40" r="30" />
      <circle cx="74" cy="40" r="30" />
    </svg>
  );
}

/**
 * Small paper airplane — the motif that threads through the real project
 * (the military aircraft icon on the marriage certificate, the
 * origami-unlock mechanic on the digital invitation). Reprised in
 * DesignThread.tsx as the "hidden thread" callout.
 */
export function DoodleAirplane(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 24 L44 6 L28 44 L22 28 L4 24Z" />
      <path d="M22 28 L44 6" />
    </svg>
  );
}

/** Dashed heart-shaped stitch line — stands in for "一條隱藏的脈絡" (the
 * hidden thread connecting all four touchpoints) in DesignThread.tsx. */
export function DoodleHeartStitch(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 40" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeDasharray="1 7" {...props}>
      <path d="M4 20 C20 2 40 2 48 14 C56 2 76 2 92 14 C100 6 112 10 116 20" />
    </svg>
  );
}
