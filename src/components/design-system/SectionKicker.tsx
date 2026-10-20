import type { ReactNode } from "react";

type KickerColor = "orange" | "blue" | "pink";

const COLOR_CLASSES: Record<KickerColor, string> = {
  orange: "text-primary-orange",
  blue: "text-secondary-blue",
  // Added for the wedding case study, whose dominant accent is
  // accent-pink -- the one color token no other project had claimed yet
  // (see docs/case-study-design-conventions.md's "主導色" rule).
  pink: "text-accent-pink",
};

/**
 * Small eyebrow label used above every section heading,
 * e.g. "◆ Project Overview".
 *
 * `color` defaults to "orange" (metro/nest-stay/piiluu), set to "blue"
 * for projects whose dominant accent is secondary-blue (TCT), or "pink"
 * for projects whose dominant accent is accent-pink (wedding).
 */
export function SectionKicker({
  icon = "◆",
  color = "orange",
  children,
}: {
  icon?: ReactNode;
  color?: KickerColor;
  children: ReactNode;
}) {
  return (
    <p className={`font-nunito flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] md:text-[13px] ${COLOR_CLASSES[color]}`}>
      <span aria-hidden>{icon}</span>
      {children}
    </p>
  );
}
