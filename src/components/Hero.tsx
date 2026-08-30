"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { HeroDoodleField } from "@/components/design-system/HeroDoodleField";
import { DoodleScribble } from "@/components/design-system/doodles";

const EYEBROW = "PRODUCT DESIGNER — REMOTE";
const NAME_LINES = ["HUANG", "CHUNG", "YUN"];
const ROLE = "Product Designer";

function Eyebrow() {
  return (
    <p className="font-nunito text-[11px] font-extrabold tracking-[0.25em] text-secondary-blue md:text-[13px]">
      {EYEBROW}
    </p>
  );
}

function Name() {
  return (
    <h1 className="mt-4 font-fredoka leading-[0.92] text-cream">
      {NAME_LINES.map((line) => (
        <span key={line} className="block text-[18vw] sm:text-[15vw] md:text-[9.5vw] lg:text-[130px]">
          {line}
        </span>
      ))}
    </h1>
  );
}

function RoleAccent() {
  return (
    <div className="relative mt-5 inline-block">
      <p className="font-fredoka text-[26px] text-secondary-blue md:text-[34px]">{ROLE}</p>
      <DoodleScribble
        aria-hidden
        className="absolute -bottom-2 left-0 h-3 w-full text-secondary-blue"
        strokeWidth={4}
      />
    </div>
  );
}

function CTAs() {
  return (
    <div className="mt-9 flex flex-wrap items-center gap-6">
      <a
        href="mailto:chungyunhuang97@gmail.com"
        className="group inline-flex items-center gap-2 border-b border-cream/60 pb-1 font-nunito text-sm tracking-wide text-cream transition-colors hover:border-cream"
      >
        Get in touch
        <ArrowUpRight size={16} weight="bold" />
      </a>
      <a
        href="#work"
        className="font-nunito text-sm font-bold tracking-wide text-secondary-blue transition-opacity hover:opacity-70"
      >
        View case studies
      </a>
    </div>
  );
}

export function Hero({ tagline }: { tagline: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-primary-orange px-6 pt-28 pb-16 md:px-10"
    >
      <HeroDoodleField sectionRef={sectionRef} reducedMotion={reducedMotion} />

      <div className="relative z-10 mx-auto w-full max-w-[1400px]">
        {/* Mobile layout */}
        <div className="md:hidden">
          <Eyebrow />
          <Name />
          <RoleAccent />
          {tagline && (
            <p className="mt-6 max-w-[46ch] font-nunito text-base leading-relaxed text-cream/85">
              {tagline}
            </p>
          )}
          <CTAs />
        </div>

        {/* Desktop layout -- text column stays inside the left ~58% so the
            doodle cluster (positioned via percentages from ~40% rightward)
            has clear space and never collides with the name/tagline. */}
        <div className="hidden max-w-[58%] md:block lg:max-w-[760px]">
          <Eyebrow />
          <Name />
          <RoleAccent />
          {tagline && (
            <p className="mt-8 max-w-[46ch] font-nunito text-lg leading-relaxed text-cream/85">
              {tagline}
            </p>
          )}
          <CTAs />
        </div>
      </div>
    </section>
  );
}
