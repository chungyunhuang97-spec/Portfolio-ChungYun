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
 * bg). Enters with a split-flap/lottery-board flip (rotateX from -90deg
 * about its top edge) instead of the plain slide-up every other section
 * uses -- Joe's explicit ask for this one banner to stand out with its own
 * entrance, "像 Lottery 一樣" (like a flip/lottery display). */
function DualTrackIntro({ process }: { process: Record<string, unknown> }) {
  const heading = process.dualTrackHeading as string | undefined;
  const body = process.dualTrackBody as string | undefined;
  if (!heading) return null;

  return (
    <motion.div
      initial={{ rotateX: -100, opacity: 0 }}
      whileInView={{ rotateX: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformPerspective: 1200, transformOrigin: "top center" }}
      className="flex w-full flex-col items-center gap-4 bg-primary-orange px-6 py-12 text-center text-white md:py-[100px]"
    >
      <h3 className="font-nunito max-w-[900px] text-[22px] leading-[30px] font-bold md:text-[28px] md:leading-[39px]">
        {heading}
      </h3>
      {body && (
        <p className="font-nunito max-w-[760px] text-[14px] leading-[22px] font-normal md:text-[18px] md:leading-[25px]">
          {body}
        </p>
      )}
    </motion.div>
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

/** Colored drop-shadow behind each swatch dot / brand button, matching
 * that element's own color at 20% alpha -- Figma's exact technique
 * (`shadow-[0px_4px_10px_rgba(<r,g,b>,0.2)]`), not a generic grey shadow. */
function tintedShadow(hex: string, blur: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { boxShadow: `0px ${blur} rgba(${r}, ${g}, ${b}, 0.2)` };
}

function UiKitCard({
  border = "grey",
  className = "",
  children,
}: {
  border?: "grey" | "orange";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative flex w-full shrink-0 flex-col gap-4 rounded-2xl border bg-proj-white p-5 md:p-6 ${
        border === "orange" ? "border-primary-orange" : "border-grey-100"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function CardHeader({ eyebrow, subtitle }: { eyebrow: string; subtitle: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-nunito text-[10px] font-extrabold tracking-[1px] text-grey-300 uppercase">{eyebrow}</span>
      <span className="font-nunito text-[13px] font-semibold text-[#555]">{subtitle}</span>
    </div>
  );
}

function ColorsCard({ colors, className = "" }: { colors: ColorSwatch[]; className?: string }) {
  return (
    <UiKitCard border="orange" className={className}>
      <CardHeader eyebrow="01. Colors" subtitle="品牌色彩與功能色定義" />
      <div className="flex flex-1 flex-col gap-2.5">
        {colors.map((c, i) => (
          <div
            key={c.name}
            className={`flex items-center gap-2.5 md:border-b md:border-grey-50 md:pb-2 ${
              i === colors.length - 1 ? "md:border-b-0 md:pb-0" : ""
            } rounded-lg bg-grey-50 p-2 md:rounded-none md:bg-transparent md:p-0`}
          >
            <span className="size-10 shrink-0 rounded-[20px]" style={{ backgroundColor: c.hex, ...tintedShadow(c.hex, "10px") }} aria-hidden />
            <div className="flex flex-col">
              <span className="font-nunito text-[12px] font-extrabold text-primary-black">{c.name}</span>
              <span className="font-nunito text-[11px] font-bold text-grey-600 uppercase">{c.hex}</span>
            </div>
          </div>
        ))}
      </div>
    </UiKitCard>
  );
}

function IconsCard({ className = "" }: { className?: string }) {
  return (
    <UiKitCard className={`h-full ${className}`}>
      <CardHeader eyebrow="02. Icons" subtitle="標準化圖標系統，涵蓋核心功能" />
      <div className="grid flex-1 grid-cols-3 content-center gap-3.5">
        {UI_KIT_ICON_FILES.map((file) => (
          <div key={file} className="flex aspect-square items-center justify-center rounded-2xl bg-grey-50">
            <Image src={`/work/piiluu/icons/${file}`} alt="" width={30} height={30} className="size-[30px] object-contain" />
          </div>
        ))}
      </div>
    </UiKitCard>
  );
}

/** Matches Figma's exact per-variant treatment (node 528:248): Submit is
 * solid primary-orange, Action is solid secondary-blue, Cancel is a white
 * pill with a red (#ee3f3f) border/text -- not a generic ghost button. */
function ButtonSwatch({ btn }: { btn: ButtonVariant }) {
  if (btn.variant === "primary") {
    return (
      <span
        className="font-nunito flex h-[42px] w-full items-center justify-center rounded-xl bg-primary-orange text-[13px] font-bold text-proj-white"
        style={tintedShadow("#ff520d", "6px")}
      >
        {btn.label}
      </span>
    );
  }
  if (btn.variant === "secondary") {
    return (
      <span
        className="font-nunito flex h-[42px] w-full items-center justify-center rounded-xl bg-secondary-blue text-[13px] font-bold text-proj-white"
        style={tintedShadow("#0d21ff", "6px")}
      >
        {btn.label}
      </span>
    );
  }
  return (
    <span className="font-nunito flex h-[42px] w-full items-center justify-center rounded-xl border border-[#ee3f3f] bg-proj-white text-[13px] font-bold text-[#ee3f3f]">
      {btn.label}
    </span>
  );
}

function InputSwatch({ input }: { input: InputVariant }) {
  const disabled = input.state.toLowerCase().includes("disabled");
  const focused = input.state.toLowerCase().includes("focus");
  return (
    <div
      className={`flex h-[42px] items-center rounded-[20px] px-4 font-nunito text-[13px] ${
        disabled
          ? "bg-[#f1f5f9] text-[#94a3b8]"
          : focused
          ? "border-2 border-primary-orange bg-proj-white text-[#333]"
          : "border border-[#e2e8f0] bg-proj-white text-[#aaa]"
      }`}
    >
      {focused ? (
        <span className="flex items-center gap-0.5">
          {input.text}
          <motion.span
            className="inline-block h-3.5 w-[1.5px] bg-primary-orange"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, repeatType: "mirror" }}
          />
        </span>
      ) : (
        input.text
      )}
    </div>
  );
}

function ComponentsCard({ buttons, inputs, className = "" }: { buttons: ButtonVariant[]; inputs: InputVariant[]; className?: string }) {
  return (
    <UiKitCard className={className}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-nunito text-[10px] font-extrabold tracking-[1px] text-grey-300 uppercase">03. Components</span>
        <span className="hidden shrink-0 items-center rounded-full border-[1.5px] border-primary-orange bg-proj-white px-3 py-1 font-nunito text-[10px] font-extrabold text-primary-orange md:inline-flex">
          Variants Defined
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-6 md:flex-row md:gap-6">
        <div className="flex flex-1 flex-col gap-3">
          <span className="font-nunito text-[10px] font-extrabold tracking-[1px] text-grey-600 uppercase">Buttons</span>
          <div className="flex flex-col gap-3">
            {buttons.map((b) => (
              <ButtonSwatch key={b.label} btn={b} />
            ))}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <span className="font-nunito text-[10px] font-extrabold tracking-[1px] text-grey-600 uppercase">Input Fields</span>
          <div className="flex flex-col gap-3">
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
function EfficiencyCard({ columns, className = "" }: { columns: EfficiencyColumn[]; className?: string }) {
  return (
    <div className={`flex h-full w-full shrink-0 flex-col gap-6 rounded-2xl border border-primary-orange bg-proj-white p-6 shadow-[0px_8px_12px_rgba(64,50,42,0.06),0px_1.5px_1.5px_rgba(64,50,42,0.04)] md:p-8 ${className}`}>
      <div className="flex flex-col gap-2">
        <span className="font-nunito text-[11px] font-extrabold tracking-[2px] text-grey-600 uppercase">Workflow Upgrade</span>
        <h5 className="font-nunito text-[20px] leading-[26px] font-bold text-primary-black md:text-[24px]">
          導入 Figma 後的效率提升
        </h5>
      </div>
      <div className="h-px w-full bg-grey-100" aria-hidden />
      <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-stretch md:gap-6">
        {columns.map((col) => {
          const iconSrc = (col.icon && EFFICIENCY_ICON_FILES[col.icon]) || EFFICIENCY_ICON_FILES.Gear;
          const isMetric = /^[+-]?\d/.test(col.subtitle);
          return (
            <div key={col.title} className="flex flex-1 flex-col justify-center gap-4 rounded-lg bg-grey-50 p-4">
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

  /** Lets the page-control dots drive the carousel too, on top of native
   * swipe/scroll (both should work, per Joe's ask) -- jumps to the i-th
   * card's snap position. */
  function goToCard(i: number) {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.children[i] as HTMLElement | undefined;
    if (!card) return;
    el.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
  }

  if (colors.length === 0) return null;

  return (
    <section className="bg-grey-50">
      {/* Full-bleed, flush against the section's top edge -- no padding
          above it, so there's no grey-50 seam between InterfaceShowcase's
          white and this orange banner. */}
      <DualTrackIntro process={process} />

      <div className="flex flex-col gap-10 px-6 py-12 md:gap-14 md:px-[120px] md:py-[100px]">
        <div className="flex flex-col gap-6">
          <SlideIn delay={0.15}>
            <UiKitHeading heading={uiKitIntro || uiKitHeading} />
          </SlideIn>

          {/* Mobile -- horizontally scrollable with pagination dots, per
              Figma's explicit "carousel pagination" note on this section.
              `w-[78vw]` (not 85vw) deliberately leaves the next card
              peeking in at the edge so the row reads as swipeable, and
              every card shares one `min-h` so none of them look like a
              single static filled block. */}
          <div className="flex flex-col gap-3 md:hidden">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="flex w-[78vw] shrink-0 snap-center"><ColorsCard colors={colors} className="h-[460px]" /></div>
              <div className="flex w-[78vw] shrink-0 snap-center"><IconsCard className="h-[460px]" /></div>
              <div className="flex w-[78vw] shrink-0 snap-center"><ComponentsCard buttons={buttons} inputs={inputs} className="h-[460px]" /></div>
              {efficiencyColumns.length > 0 && (
                <div className="flex w-[78vw] shrink-0 snap-center"><EfficiencyCard columns={efficiencyColumns} className="h-[460px]" /></div>
              )}
            </div>
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: cardCount }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to card ${i + 1}`}
                  onClick={() => goToCard(i)}
                  className={`h-[8px] rounded-full transition-all duration-300 ${i === activeDot ? "w-6 bg-secondary-blue" : "w-[8px] bg-grey-300"}`}
                />
              ))}
            </div>
          </div>

          {/* Desktop -- two-column grid per Figma node 526:1832: a narrow
              left column (Colors stacked above Icons) beside a wider right
              column (Components stacked above the Workflow Upgrade card).
              Each column's second card gets `flex-1` so both columns'
              visible card boxes reach the same bottom edge, instead of the
              naturally-shorter left column (Colors+Icons) leaving a gap
              below the naturally-taller right column (Components+Workflow). */}
          <SlideIn delay={0.2}>
            <div className="hidden items-stretch gap-6 md:grid md:grid-cols-[360px_1fr]">
              <div className="flex flex-col gap-6">
                <ColorsCard colors={colors} />
                <div className="flex flex-1 flex-col"><IconsCard /></div>
              </div>
              <div className="flex flex-col gap-6">
                <ComponentsCard buttons={buttons} inputs={inputs} />
                {efficiencyColumns.length > 0 && (
                  <div className="flex flex-1 flex-col"><EfficiencyCard columns={efficiencyColumns} /></div>
                )}
              </div>
            </div>
          </SlideIn>
        </div>
      </div>
    </section>
  );
}
