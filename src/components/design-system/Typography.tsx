import type { ElementType, ReactNode } from "react";

/**
 * Shared typography primitives for the "project page" design system
 * (case-study pages, and eventually the homepage).
 *
 * Responsive strategy: this design system only targets two breakpoints —
 * mobile (390px) and desktop (1440px) — so every style here is mobile-first
 * with a single `md:` override for desktop, matching the Figma spec.
 *
 * Font: Nunito (`--font-nunito`, loaded in `app/layout.tsx`). Scoped via the
 * `font-nunito` utility rather than replacing the global body font, so
 * other (non-project-page) screens are unaffected.
 */

type TextProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
};

function makeText(defaultTag: ElementType, classes: string) {
  return function Text({ children, as, className = "" }: TextProps) {
    const Tag = as ?? defaultTag;
    return (
      <Tag className={`font-nunito ${classes} ${className}`.trim()}>
        {children}
      </Tag>
    );
  };
}

// display-hero — PC 80px / Mobile 36px
export const DisplayHero = makeText(
  "h1",
  "text-[36px] leading-[1.05] font-extrabold tracking-tight md:text-[80px]"
);

// heading-h1 — PC 48px / Mobile 28px
export const HeadingH1 = makeText(
  "h2",
  "text-[28px] leading-[1.15] font-extrabold tracking-tight md:text-[48px]"
);

// heading-h2 — PC 36px / Mobile 22px
export const HeadingH2 = makeText(
  "h3",
  "text-[22px] leading-[1.2] font-bold tracking-tight md:text-[36px]"
);

// heading-h3 — PC 28px / Mobile 18px
export const HeadingH3 = makeText(
  "h4",
  "text-[18px] leading-[1.25] font-bold md:text-[28px]"
);

// heading-h4 — PC 24px / Mobile 16px
export const HeadingH4 = makeText(
  "h5",
  "text-[16px] leading-[1.3] font-bold md:text-[24px]"
);

// heading-h5 — PC 18px / Mobile 14px
export const HeadingH5 = makeText(
  "h6",
  "text-[14px] leading-[1.35] font-bold md:text-[18px]"
);

// body-large — PC 18px / Mobile 14px
export const BodyLarge = makeText(
  "p",
  "text-[14px] leading-[1.6] font-normal md:text-[18px]"
);

// body-medium — PC 15px / Mobile 13px
export const BodyMedium = makeText(
  "p",
  "text-[13px] leading-[1.6] font-normal md:text-[15px]"
);

// body-small — PC 13px / Mobile 11px
export const BodySmall = makeText(
  "p",
  "text-[11px] leading-[1.5] font-normal md:text-[13px]"
);

// label-medium — PC 14px / Mobile 12px
export const LabelMedium = makeText(
  "span",
  "text-[12px] leading-[1.3] font-bold tracking-wide md:text-[14px]"
);

// label-small — PC 13px / Mobile 10px (used for the Section Kicker etc.)
export const LabelSmall = makeText(
  "span",
  "text-[10px] leading-[1.3] font-bold tracking-[0.15em] uppercase md:text-[13px]"
);

// decorative-number — PC 100px / Mobile 48px
export const DecorativeNumber = makeText(
  "span",
  "text-[48px] leading-none font-extrabold tabular-nums md:text-[100px]"
);

// stat-number — PC 80px / Mobile 36px
export const StatNumber = makeText(
  "span",
  "text-[36px] leading-none font-extrabold tabular-nums md:text-[80px]"
);
