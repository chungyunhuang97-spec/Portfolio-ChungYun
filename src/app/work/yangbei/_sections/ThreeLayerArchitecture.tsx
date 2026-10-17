"use client";

import { motion } from "framer-motion";
import { SlideIn } from "@/components/design-system/SlideIn";

interface Platform {
  id: string;
  name: string;
  label: string;
  color: string;
  url: string;
  auth: string;
  desc: string;
  features: string[];
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: EASE },
  }),
};

/** Connector line between platform nodes (desktop only, horizontal arrows). */
function ConnectorArrow() {
  return (
    <div className="hidden shrink-0 flex-col items-center justify-center gap-1 md:flex" aria-hidden>
      <div className="h-px w-8 bg-white/20" />
      <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
        <path d="M1 1l4 4-4 4" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/**
 * 一套系統，三種角色 — architecture overview.
 * Shows the 3-layer platform (前台/中台/後台) as cards with colour-coded accents.
 * Content from `process.architectureTitle`, `process.architectureSubtitle`, `process.platforms`.
 */
export function ThreeLayerArchitecture({ process }: { process: Record<string, unknown> }) {
  const title = (process.architectureTitle as string) || "一套系統，三種角色";
  const subtitle = (process.architectureSubtitle as string) || "";
  const platforms = Array.isArray(process.platforms)
    ? (process.platforms as Platform[])
    : [];

  if (platforms.length === 0) return null;

  return (
    <section className="bg-[#0A0A0A] px-6 py-16 md:px-[120px] md:py-[80px]">
      <SlideIn delay={0.05}>
        <div className="mb-10 flex flex-col gap-3 md:mb-14">
          <span className="font-nunito text-[13px] font-extrabold tracking-[1px] text-white/60 uppercase">
            System Architecture
          </span>
          <h2 className="font-nunito text-[28px] leading-[38px] font-bold text-white md:text-[44px] md:leading-[56px]">
            {title}
          </h2>
          {subtitle && (
            <p className="font-nunito max-w-[560px] text-[14px] leading-[22px] text-white/50 md:text-[16px] md:leading-[26px]">
              {subtitle}
            </p>
          )}
        </div>
      </SlideIn>

      {/* Architecture diagram: horizontal on desktop, vertical stack on mobile */}
      <motion.div
        className="flex flex-col gap-4 md:flex-row md:items-stretch md:gap-0"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      >
        {platforms.map((platform, i) => (
          <div key={platform.id} className="contents">
            {i > 0 && <ConnectorArrow />}
            <motion.div
              custom={i}
              variants={cardVariants}
              className="flex flex-1 flex-col gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 md:p-7"
              style={{ borderTopColor: platform.color, borderTopWidth: 3 }}
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <span
                  className="font-nunito text-[20px] font-bold leading-none"
                  style={{ color: platform.color }}
                >
                  {platform.name}
                </span>
                <span className="font-nunito rounded-full border border-white/15 px-2.5 py-0.5 text-[11px] text-white/50">
                  {platform.label}
                </span>
              </div>

              {/* Auth badge */}
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <circle cx="7" cy="7" r="6" stroke="white" strokeOpacity="0.3" strokeWidth="1.2" />
                  <path d="M4.5 7l1.8 1.8L9.5 5.5" stroke="white" strokeOpacity="0.5" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="font-nunito text-[12px] text-white/40">
                  {platform.auth}
                </span>
              </div>

              {/* Desc */}
              <p className="font-nunito text-[13px] leading-[20px] text-white/60 md:text-[14px] md:leading-[22px]">
                {platform.desc}
              </p>

              {/* Features */}
              <ul className="flex flex-col gap-2 border-t border-white/[0.06] pt-4">
                {platform.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2">
                    <span
                      className="size-[5px] shrink-0 rounded-full"
                      style={{ backgroundColor: platform.color }}
                      aria-hidden
                    />
                    <span className="font-nunito text-[12px] text-white/50 md:text-[13px]">
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>

              {/* URL chip */}
              <div className="mt-auto pt-2">
                <span className="font-nunito rounded-md bg-white/[0.06] px-2.5 py-1 text-[11px] text-white/30 font-mono">
                  {platform.url}
                </span>
              </div>
            </motion.div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
