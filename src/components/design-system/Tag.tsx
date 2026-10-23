import type { ReactNode } from "react";

type TagVariant = "orange" | "pink" | "outline" | "blue" | "cream";

const VARIANT_CLASSES: Record<TagVariant, string> = {
  orange: "bg-primary-orange text-proj-white",
  pink: "bg-accent-pink text-proj-white",
  outline: "border border-grey-300 text-grey-700",
  // Added for Piiluu, whose dominant accent is secondary-blue rather than
  // orange (see docs/case-study-design-conventions.md's "主導色" rule) --
  // purely additive, existing "orange"/"pink"/"outline" usages elsewhere
  // (Nest Stay, Metro) are untouched.
  blue: "bg-secondary-blue text-proj-white",
  // Wedding Hero's skill-badge row ("UI設計" / "網站開發" / ...) per Figma --
  // pale cream pill with a hairline border, legible both overlaid on the
  // desktop Hero photo and on mobile's plain white background.
  cream: "border border-grey-100 bg-wedding-cream text-grey-800",
};

/**
 * Rounded pill tag/chip — used for Hero chips (智慧引導 / 安心陪伴),
 * and Short-term / Long-term roadmap labels.
 */
export function Tag({
  children,
  variant = "orange",
  className = "",
}: {
  children: ReactNode;
  variant?: TagVariant;
  className?: string;
}) {
  return (
    <span
      className={`font-nunito inline-flex items-center rounded-full px-4 py-1.5 text-[12px] font-bold md:text-[13px] ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
