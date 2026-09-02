"use client";

import Image from "next/image";
import { SlideIn } from "@/components/design-system/SlideIn";

interface Pillar {
  title: string;
  subtitle: string;
  /** One of the keys in ILLUSTRATION_MAP below. */
  icon?: string;
}

/** Real illustration assets Joe supplied for the 3 pillar cards (confirmed
 * against Figma nodes 481:201 / 542:261 via get_design_context -- these are
 * the exact same three images used there), saved to
 * /public/work/piiluu/pillars. Keyed by the `icon` field already stored in
 * Supabase (ShieldCheck/Lightning/Stack). */
const ILLUSTRATION_MAP: Record<string, string> = {
  ShieldCheck: "/work/piiluu/pillars/trust.png",
  Lightning: "/work/piiluu/pillars/efficiency.png",
  Stack: "/work/piiluu/pillars/design-system.png",
};

function PillarIllustration({ icon, size }: { icon?: string; size: number }) {
  const src = (icon && ILLUSTRATION_MAP[icon]) || ILLUSTRATION_MAP.ShieldCheck;
  return <Image src={src} alt="" width={size} height={size} className="shrink-0 object-cover" style={{ width: size, height: size }} />;
}

/** Desktop: bg-white card, centered column, 128px icon (Figma 481:209). */
function DesktopPillarCard({ pillar }: { pillar: Pillar }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl bg-white px-7 py-8 shadow-[0px_1.5px_1.5px_0px_rgba(64,50,42,0.04),0px_8px_12px_0px_rgba(64,50,42,0.06)]">
      <PillarIllustration icon={pillar.icon} size={128} />
      <h4 className="font-nunito text-[18px] font-bold text-[#1a1a1a]">{pillar.title}</h4>
      <p className="font-nunito text-[16px] font-normal text-[#666]">{pillar.subtitle}</p>
    </div>
  );
}

/** Mobile: flat bg-[#F5F5F5] row, 48px icon left + text right (Figma
 * 542:269). No border/shadow -- distinct from the desktop card treatment. */
function MobilePillarRow({ pillar }: { pillar: Pillar }) {
  return (
    <div className="flex w-full items-center gap-4 rounded-2xl bg-[#f5f5f5] p-5">
      <PillarIllustration icon={pillar.icon} size={48} />
      <div className="flex flex-1 flex-col gap-1">
        <h4 className="font-nunito text-[18px] font-bold text-[#1a1a1a]">{pillar.title}</h4>
        <p className="font-nunito text-[16px] font-normal text-[#666]">{pillar.subtitle}</p>
      </div>
    </div>
  );
}

/**
 * 三大核心策略 (ThreePillars), Figma fileKey 8qGUSDUJqOgJaSERffGXVc, desktop
 * node 481:201 / mobile node 542:261. Section bg is `#E6E6E6` at both
 * breakpoints (darker than the surrounding sections -- matched exactly,
 * not simplified to an existing grey token). Desktop divider is a plain
 * line image; mobile divider is a `border-b` under the heading block
 * instead -- two different techniques in Figma, kept as-is.
 *
 * Content model: `process.pillars` (3x {title, subtitle, icon}).
 */
export function ThreePillars({ process }: { process: Record<string, unknown> }) {
  const heading = (process.pillarsHeading as string) || "三大核心策略";
  const pillars = Array.isArray(process.pillars) ? (process.pillars as Pillar[]) : [];

  if (pillars.length === 0) return null;

  return (
    <section className="bg-[#e6e6e6] px-6 py-12 md:px-[200px] md:py-20">
      <div className="flex flex-col gap-6 md:gap-9">
        <SlideIn delay={0.1}>
          <div className="flex flex-col gap-3 border-b border-[#b3b3b3] pb-6 md:border-none md:pb-0">
            <div className="flex items-center gap-2">
              <span className="size-2 shrink-0 rounded-full bg-primary-orange" aria-hidden />
              <span className="font-nunito text-[14px] font-extrabold text-primary-orange">STRATEGY</span>
            </div>
            <h3 className="font-nunito text-[32px] leading-[48px] font-bold text-black md:text-[48px] md:leading-[72px] md:text-[#333]">
              {heading}
            </h3>
            <div className="hidden h-px w-full bg-grey-100 md:block" />
          </div>
        </SlideIn>

        {/* Mobile -- stacked flat rows */}
        <div className="flex flex-col gap-4 md:hidden">
          {pillars.map((pillar, i) => (
            <SlideIn key={pillar.title} delay={0.15 + i * 0.08}>
              <MobilePillarRow pillar={pillar} />
            </SlideIn>
          ))}
        </div>

        {/* Desktop -- 3-column row of white cards */}
        <div className="hidden gap-6 md:flex">
          {pillars.map((pillar, i) => (
            <SlideIn key={pillar.title} delay={0.15 + i * 0.08} className="flex flex-1">
              <DesktopPillarCard pillar={pillar} />
            </SlideIn>
          ))}
        </div>
      </div>
    </section>
  );
}
