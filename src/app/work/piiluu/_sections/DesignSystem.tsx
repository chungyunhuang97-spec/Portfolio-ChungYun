"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { animate, motion, useInView } from "framer-motion";
import { SlideIn } from "@/components/design-system/SlideIn";

/** Real icon assets pulled directly from the Figma "02. ICONS" grid
 * (node 528:210), downloaded to /public/work/piiluu/icons -- not
 * phosphor substitutes, these are the actual approved glyphs. */
const UI_KIT_ICON_FILES = [
  "ui-icon-01-user.png",
  "ui-icon-02-camera.png",
  "ui-icon-03-lock.png",
  "ui-icon-04-filter.png",
  "ui-icon-05-faceid.png",
  "ui-icon-06-target.png",
  "ui-icon-07-wallet-orange.png",
  "ui-icon-08-lock-blue.png",
  "ui-icon-09-wallet-grey.png",
  "ui-icon-10-cart.png",
  "ui-icon-11-check.png",
  "ui-icon-12-warning.png",
];

/** Real SVG icons for the Workflow Upgrade card, pulled from Figma node
 * 526:2672 -- matches the design exactly (gear / cloud / shield-check). */
const EFFICIENCY_ICON_FILES: Record<string, string> = {
  Gear: "/work/piiluu/efficiency-icon-settings.svg",
  CloudArrowUp: "/work/piiluu/efficiency-icon-cloud.svg",
  ShieldCheck: "/work/piiluu/efficiency-icon-shield.svg",
};

interface ColorSwatch {
  name: string;
  hex: string;
}

interface ButtonVariant {
  label: string;
  variant: "primary" | "secondary" | "ghost";
}

interface InputVariant {
  state: string;
  text: string;
}

interface EfficiencyColumn {
  icon?: string;
  title: string;
  subtitle: string;
  description: string;
}

/** Counts a numeric-ish value (e.g. "-35%") up from 0 once scrolled into
 * view -- copied from Metro's `Results.tsx` CountUpValue pattern. */
function CountUpValue({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px" });
  const match = value.match(/^([+>-]?)(\d+(?:\.\d+)?)(.*)$/);
  const prefix = match ? match[1] : "";
  const target = match ? parseFloat(match[2]) : 0;
  const decimals = match && match[2].includes(".") ? match[2].split(".")[1].length : 0;
  const suffix = match ? match[3] : "";
  const [text, setText] = useState(match ? `${prefix}0${suffix}` : value);

  useEffect(() => {
    if (!inView || !match) return;
    const controls = animate(0, target, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v) => setText(`${prefix}${v.toFixed(decimals)}${suffix}`),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}

/** "同步構建與迭代：雙軌並行的設計策略" intro -- Figma node 488:251, a full-bleed
 * solid primary-orange banner (not a plain text block on the section's own
 * bg). */
function DualTrackIntro({ process }: { process: Record<string, unknown> }) {
  const heading = process.dualTrackHeading as string | undefined;
  const body = process.dualTrackBody as string | undefined;
  if (!heading) return null;

  return (
    <SlideIn delay={0.1}>
      <div className="-mx-6 flex flex-col items-center gap-4 bg-primary-orange px-6 py-12 text-center text-white md:-mx-[200px] md:py-[100px]">
        <h3 className="font-nunito max-w-[900px] text-[22px] leading-[30px] font-bold md:text-[28px] md:leading-[39px]">
          {heading}
        </h3>
        {body && (
          <p className="font-nunito max-w-[760px] text-[14px] leading-[22px] font-normal md:text-[18px] md:leading-[25px]">
            {body}
          </p>
        )}
      </div>
    </SlideIn>
  );
}

/** UI Kit System section heading -- Figma node 528:193 (desktop, "layers"
 * icon kicker) / 551:329 (mobile, dot kicker instead). */
function UiKitHeading({ heading, intro }: { heading: string; intro?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center md:gap-4">
      <div className="hidden items-center gap-2 md:flex">
        <Image src="/work/piiluu/uikit/icon-layers.svg" alt="" width={16} height={16} />
        <span className="font-nunito text-[14px] font-extrabold text-primary-orange">UI Kit System</span>
      </div>
      <div className="flex items-center gap-2 md:hidden">
        <span className="size-2 rounded-full bg-primary-orange" aria-hidden />
        <span className="font-nunito text-[13px] font-extrabold tracking-[0.66px] text-primary-orange">UI KIT SYSTEM</span>
      </div>
      <h4 className="font-nunito max-w-[900px] text-[20px] leading-7 font-bold text-black md:text-[40px] md:leading-[56px]">{heading}</h4>
      {intro && <p className="font-nunito text-[13px] font-normal text-[#666] md:hidden">{intro}</p>}
      <div className="h-px w-full bg-grey-300/60 opacity-60" />
    </div>
  );
}

function UiKitCard({
  label,
  headerRight,
  className = "",
  children,
}: {
  label: string;
  headerRight?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex w-full shrink-0 flex-col gap-4 rounded-2xl border border-grey-100 bg-proj-white p-5 shadow-[0px_8px_12px_rgba(64,50,42,0.06),0px_1.5px_1.5px_rgba(64,50,42,0.04)] md:p-6 ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-nunito text-[12px] font-extrabold tracking-[0.6px] text-secondary-blue uppercase">{label}</span>
        {headerRight}
      </div>
      {children}
    </div>
  );
}

function ColorsCard({ colors }: { colors: ColorSwatch[] }) {
  return (
    <UiKitCard label="01. Colors">
      <div className="flex flex-col gap-3">
        {colors.map((c) => (
          <div key={c.name} className="flex items-center gap-3">
            <span className="size-8 shrink-0 rounded-lg border border-black/5" style={{ backgroundColor: c.hex }} aria-hidden />
            <div className="flex flex-col">
              <span className="font-nunito text-[13px] font-bold text-primary-black">{c.name}</span>
              <span className="font-nunito text-[11px] font-normal text-grey-500 uppercase">{c.hex}</span>
            </div>
          </div>
        ))}
      </div>
    </UiKitCard>
  );
}

function IconsCard() {
  return (
    <UiKitCard label="02. Icons">
      <div className="grid grid-cols-3 gap-3">
        {UI_KIT_ICON_FILES.map((file) => (
          <div key={file} className="flex aspect-square items-center justify-center rounded-2xl bg-grey-50">
            <Image src={`/work/piiluu/icons/${file}`} alt="" width={26} height={26} className="size-[26px] object-contain" />
          </div>
        ))}
      </div>
    </UiKitCard>
  );
}

function ButtonSwatch({ btn }: { btn: ButtonVariant }) {
  const classes =
    btn.variant === "primary"
      ? "bg-secondary-blue text-proj-white"
      : btn.variant === "secondary"
      ? "border border-secondary-blue text-secondary-blue bg-transparent"
      : "text-grey-500 bg-transparent";
  return (
    <span className={`font-nunito flex h-[42px] w-full items-center justify-center rounded-full text-[13px] font-bold ${classes}`}>
      {btn.label}
    </span>
  );
}

function InputSwatch({ input }: { input: InputVariant }) {
  const disabled = input.state.toLowerCase().includes("disabled");
  const focused = input.state.toLowerCase().includes("focus");
  return (
    <div className="flex flex-col gap-1">
      <span className="font-nunito text-[10px] font-bold text-grey-500">{input.state}</span>
      <div
        className={`flex h-9 items-center rounded-lg border px-3 font-nunito text-[12px] ${
          disabled
            ? "border-grey-100 bg-grey-50 text-grey-300"
            : focused
            ? "border-secondary-blue bg-proj-white text-primary-black"
            : "border-grey-100 bg-proj-white text-grey-500"
        }`}
      >
        {focused ? (
          <span className="flex items-center gap-0.5">
            {input.text}
            <motion.span
              className="inline-block h-3.5 w-[1.5px] bg-secondary-blue"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, repeatType: "mirror" }}
            />
          </span>
        ) : (
          input.text
        )}
      </div>
    </div>
  );
}

function ComponentsCard({ buttons, inputs }: { buttons: ButtonVariant[]; inputs: InputVariant[] }) {
  return (
    <UiKitCard
      label="03. Components"
      headerRight={
        <span className="inline-flex w-fit items-center rounded-full bg-secondary-blue/10 px-2.5 py-1 font-nunito text-[10px] font-bold text-secondary-blue">
          Variants Defined
        </span>
      }
    >
      <div className="flex flex-col gap-6 md:flex-row md:gap-6">
        <div className="flex flex-1 flex-col gap-3">
          <span className="font-nunito text-[10px] font-extrabold tracking-[1px] text-grey-500 uppercase">Buttons</span>
          <div className="flex flex-col gap-2">
            {buttons.map((b) => (
              <ButtonSwatch key={b.label} btn={b} />
            ))}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <span className="font-nunito text-[10px] font-extrabold tracking-[1px] text-grey-500 uppercase">Input Fields</span>
          <div className="flex flex-col gap-2">
            {inputs.map((inp) => (
              <InputSwatch key={inp.state} input={inp} />
            ))}
          </div>
        </div>
      </div>
    </UiKitCard>
  );
}

/** Matches Figma node 526:2672 exactly -- this specific card is the one
 * spot in piiluu's UI Kit System that intentionally breaks from the
 * page's blue-dominant accent and uses primary-orange instead (confirmed
 * against the approved Figma file, not a leftover/inconsistency). */
function EfficiencyCard({ columns }: { columns: EfficiencyColumn[] }) {
  return (
    <div className="flex w-full shrink-0 flex-col gap-6 rounded-2xl border border-primary-orange bg-proj-white p-6 shadow-[0px_8px_12px_rgba(64,50,42,0.06),0px_1.5px_1.5px_rgba(64,50,42,0.04)] md:p-8">
      <div className="flex flex-col gap-2">
        <span className="font-nunito text-[11px] font-extrabold tracking-[2px] text-grey-600 uppercase">Workflow Upgrade</span>
        <h5 className="font-nunito text-[20px] leading-[26px] font-bold text-primary-black md:text-[24px]">
          導入 Figma 後的效率提升
        </h5>
      </div>
      <div className="h-px w-full bg-grey-100" aria-hidden />
      <div className="flex flex-col gap-5 md:flex-row md:gap-4">
        {columns.map((col) => {
          const iconSrc = (col.icon && EFFICIENCY_ICON_FILES[col.icon]) || EFFICIENCY_ICON_FILES.Gear;
          const isMetric = /^[+-]?\d/.test(col.subtitle);
          return (
            <div key={col.title} className="flex flex-1 flex-col gap-4">
              <span className="flex size-11 items-center justify-center rounded-[22px] bg-primary-orange/[0.12]">
                <Image src={iconSrc} alt="" width={22} height={22} className="size-[22px]" />
              </span>
              <div className="flex flex-col gap-1">
                <p className="font-nunito text-[15px] font-bold text-grey-600">{col.title}</p>
                {isMetric ? (
                  <CountUpValue value={col.subtitle} className="font-fredoka text-[20px] leading-none text-primary-orange" />
                ) : (
                  <p className="font-nunito text-[11px] font-extrabold tracking-[1px] text-primary-orange uppercase">{col.subtitle}</p>
                )}
              </div>
              <p className="font-nunito text-[12px] leading-[1.6] font-normal text-grey-900">{col.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Design system section -- DualTrackIntro + "UI Kit System" grid (Colors /
 * Icons / Components / Efficiency), Figma fileKey 8qGUSDUJqOgJaSERffGXVc.
 * Bundled into one file/component since both sub-parts are one narrative
 * beat in Figma's page order (item 5 in the section list).
 *
 * Content model: `process.dualTrackHeading` / `dualTrackBody`,
 * `process.uiKitHeading` / `uiKitIntro`, `process.uiKitColors` (3x
 * {name, hex}), `process.uiKitIcons` unused (icon set is hardcoded --
 * purely decorative, no specific icons were given), `process.uiKitButtons`
 * (3x {label, variant}), `process.uiKitInputs` (3x {state, text}),
 * `process.efficiencyColumns` (3x {icon?, title, subtitle, description} --
 * copy is placeholder, see report). Desktop: cards in a row. Mobile:
 * horizontally-scrollable row with pagination dots, per Figma's explicit
 * "carousel pagination" note on this section.
 */
export function DesignSystem({ process }: { process: Record<string, unknown> }) {
  const uiKitHeading = (process.uiKitHeading as string) || "UI Kit System";
  const uiKitIntro = process.uiKitIntro as string | undefined;
  const colors = Array.isArray(process.uiKitColors) ? (process.uiKitColors as ColorSwatch[]) : [];
  const buttons = Array.isArray(process.uiKitButtons) ? (process.uiKitButtons as ButtonVariant[]) : [];
  const inputs = Array.isArray(process.uiKitInputs) ? (process.uiKitInputs as InputVariant[]) : [];
  const efficiencyColumns = Array.isArray(process.efficiencyColumns) ? (process.efficiencyColumns as EfficiencyColumn[]) : [];

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);
  const cardCount = 4;

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const ratio = el.scrollLeft / Math.max(1, el.scrollWidth - el.clientWidth);
    setActiveDot(Math.min(cardCount - 1, Math.round(ratio * (cardCount - 1))));
  }

  if (colors.length === 0) return null;

  return (
    <section className="bg-grey-50 px-6 py-12 md:px-[120px] md:py-[100px]">
      <div className="flex flex-col gap-10 md:gap-14">
        <DualTrackIntro process={process} />

        <div className="flex flex-col gap-6">
          <SlideIn delay={0.15}>
            <UiKitHeading heading={uiKitIntro || uiKitHeading} />
          </SlideIn>

          {/* Mobile -- horizontally scrollable with pagination dots, per
              Figma's explicit "carousel pagination" note on this section. */}
          <div className="flex flex-col gap-3 md:hidden">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="w-[85vw] shrink-0 snap-center"><ColorsCard colors={colors} /></div>
              <div className="w-[85vw] shrink-0 snap-center"><IconsCard /></div>
              <div className="w-[85vw] shrink-0 snap-center"><ComponentsCard buttons={buttons} inputs={inputs} /></div>
              {efficiencyColumns.length > 0 && (
                <div className="w-[85vw] shrink-0 snap-center"><EfficiencyCard columns={efficiencyColumns} /></div>
              )}
            </div>
            <div className="flex items-center justify-center gap-2" aria-hidden>
              {Array.from({ length: cardCount }).map((_, i) => (
                <span
                  key={i}
                  className={`h-[8px] rounded-full transition-all duration-300 ${i === activeDot ? "w-6 bg-secondary-blue" : "w-[8px] bg-grey-300"}`}
                />
              ))}
            </div>
          </div>

          {/* Desktop -- two-column grid per Figma node 526:1832: a narrow
              left column (Colors stacked above Icons) beside a wider right
              column (Components stacked above the Workflow Upgrade card). */}
          <SlideIn delay={0.2}>
            <div className="hidden gap-6 md:grid md:grid-cols-[360px_1fr]">
              <div className="flex flex-col gap-6">
                <ColorsCard colors={colors} />
                <IconsCard />
              </div>
              <div className="flex flex-col gap-6">
                <ComponentsCard buttons={buttons} inputs={inputs} />
                {efficiencyColumns.length > 0 && <EfficiencyCard columns={efficiencyColumns} />}
              </div>
            </div>
          </SlideIn>
        </div>
      </div>
    </section>
  );
}
