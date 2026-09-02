"use client";

import Image from "next/image";
import { SlideIn } from "@/components/design-system/SlideIn";

interface Pillar {
  title: string;
  subtitle: string;
  /** One of the keys in ILLUSTRATION_MAP below. */
  icon?: string;
}

/** Real illustration assets Joe supplied for the 3 pillar cards, saved to
 * /public/work/piiluu/pillars. Keyed by the same `icon` field already
 * stored in Supabase (ShieldCheck/Lightning/Stack) so no content migration
 * was needed when swapping from the phosphor-icon placeholders. */
const ILLUSTRATION_MAP: Record<string, string> = {
  ShieldCheck: "/work/piiluu/pillars/trust.png",
  Lightning: "/work/piiluu/pillars/efficiency.png",
  Stack: "/work/piiluu/pillars/design-system.png",
};

function PillarIcon({ icon }: { icon?: string }) {
  const src = (icon && ILLUSTRATION_MAP[icon]) || ILLUSTRATION_MAP.ShieldCheck;
  return (
    <div className="flex size-12 shrink-0 items-center justify-center md:size-[128px]">
      <Image src={src} alt="" width={128} height={128} className="size-full object-contain" />
    </div>
  );
}

function PillarCard({ pillar }: { pillar: Pillar }) {
  return (
    <div className="flex w-full items-center gap-4 rounded-2xl border border-grey-100 bg-proj-white p-4 shadow-[0px_8px_12px_rgba(64,50,42,0.06),0px_1.5px_1.5px_rgba(64,50,42,0.04)] md:flex-col md:items-start md:gap-6 md:p-8">
      <PillarIcon icon={pillar.icon} />
      <div className="flex flex-col gap-1">
        <h4 className="font-nunito text-[16px] font-bold text-primary-black md:text-[24px]">{pillar.title}</h4>
        <p className="font-nunito text-[13px] font-normal text-grey-600 md:text-[16px]">{pillar.subtitle}</p>
      </div>
    </div>
  );
}

/**
 * 三大核心策略 (ThreePillars), Figma fileKey 8qGUSDUJqOgJaSERffGXVc. Content
 * model: `process.pillars` (3x {title, subtitle, icon}), icon resolved via
 * ILLUSTRATION_MAP above. Desktop: 3-column row, 128px icon slot. Mobile:
 * stacked list, 48px icon slot, icon+text laid out horizontally per row
 * instead of stacked.
 */
export function ThreePillars({ process }: { process: Record<string, unknown> }) {
  const heading = (process.pillarsHeading as string) || "三大核心策略";
  const pillars = Array.isArray(process.pillars) ? (process.pillars as Pillar[]) : [];

  if (pillars.length === 0) return null;

  return (
    <section className="bg-grey-50 px-6 py-12 md:px-[120px] md:py-[100px]">
      <div className="flex flex-col gap-8 md:gap-12">
        <SlideIn delay={0.1}>
          <div className="flex flex-col gap-3">
            <span className="font-nunito text-[13px] font-extrabold tracking-[0.78px] text-secondary-blue uppercase">
              Strategy
            </span>
            <h3 className="font-nunito text-[26px] leading-[34px] font-bold text-primary-black md:text-[44px] md:leading-[56px]">
              {heading}
            </h3>
          </div>
        </SlideIn>

        <div className="flex flex-col gap-4 md:flex-row md:gap-6">
          {pillars.map((pillar, i) => (
            <SlideIn key={pillar.title} delay={0.15 + i * 0.08} className="w-full md:flex-1">
              <PillarCard pillar={pillar} />
            </SlideIn>
          ))}
        </div>
      </div>
    </section>
  );
}
