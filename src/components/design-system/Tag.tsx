import type { ReactNode } from "react";

type TagVariant = "orange" | "pink" | "outline" | "blue";

const VARIANT_CLASSES: Record<TagVariant, string> = {
  orange: "bg-primary-orange text-proj-white",
  pink: "bg-accent-pink text-proj-white",
  outline: "border border-grey-300 text-grey-700",
  // Added for Piiluu, whose dominant accent is secondary-blue rather than
  // orange (see docs/case-study-design-conventions.md's "主導色" rule) --
  // purely additive, existing "orange"/"pink"/"outline" usages elsewhere
  // (Nest Stay, Metro) are untouched.
  blue: "bg-secondary-blue text-proj-white",
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
