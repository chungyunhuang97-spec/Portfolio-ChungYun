"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject, SVGProps } from "react";
import { motion, useScroll, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { ImageSquare } from "@phosphor-icons/react/dist/ssr";
import { SlideIn } from "@/components/design-system/SlideIn";
import { SectionKicker } from "@/components/design-system/SectionKicker";

/** Every zone's Design/Live frame renders at this same fixed width on
 * desktop, whether or not it shares its row with a step list -- Joe's
 * "frame 大小忽大忽小" note: `object-contain` already kept each image's own
 * aspect ratio from being cropped, but the FRAME ITSELF still rendered at
 * different widths (Zone 1 constrained by sharing a grid row with
 * StepList, Zone 2/3 stretching up to their own `max-w`). Fixing the
 * column width here makes all three read as one consistent frame size. */
const FRAME_WIDTH = "md:w-[520px]";

interface ZoneStep {
  label: string;
  desc?: string;
  /** Design-mode screenshot for this specific step. Only one step tends to
   * have a matching reference screenshot at a time -- steps without one
   * fall back to DeviceFrame's own empty state rather than reusing another
   * step's image, since the screens genuinely differ step to step. Key
   * ends in `ImageUrl` so the admin's generic ContentEditor recognizes it
   * as a media field (see MEDIA_KEY_PATTERN) and renders an upload
   * dropzone for it instead of a plain text input. */
  designImageUrl?: string;
}

interface Zone {
  title: string;
  desc: string;
  steps?: ZoneStep[];
  /** Fallback Design-mode image for zones with no per-step stepper
   * (Zone 2/3). Zone 1 instead uses each step's own `designImageUrl`. */
  designImageUrl?: string;
  designCaption?: string;
  /** One real recording per zone, shown in Live mode regardless of which
   * step is selected -- the footage demonstrates the zone as a whole, it
   * isn't cut per step. */
  liveImageUrl?: string;
  liveCaption?: string;
}

/** Zone 1 -- 世界地圖導覽: a hierarchical drill-down (world → continent →
 * session → detail), drawn as three nested rings collapsing toward a
 * center point. */
function DoodleDrillDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2.5} {...props}>
      <circle cx="24" cy="24" r="19" strokeDasharray="2 4" />
      <circle cx="24" cy="24" r="12" />
      <circle cx="24" cy="24" r="4" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Zone 2 -- 舞台之外的風景: a waterfall/masonry photo wall, drawn as
 * three offset rectangles of different heights. */
function DoodleMasonry(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinejoin="round" {...props}>
      <rect x="5" y="10" width="12" height="18" rx="2" />
      <rect x="19" y="6" width="12" height="26" rx="2" />
      <rect x="33" y="14" width="10" height="14" rx="2" />
    </svg>
  );
}

/** Zone 3 -- 直覺式影音操作: an oversized play button, matching the
 * "放大熱區" accessibility goal rather than a generic media icon. */
function DoodlePlayTarget(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2.5} {...props}>
      <circle cx="24" cy="24" r="19" />
      <path d="M20 16l12 8-12 8z" fill="currentColor" stroke="none" />
    </svg>
  );
}

const ZONE_ICONS = [DoodleDrillDown, DoodleMasonry, DoodlePlayTarget];

/** Live-mode uploads are commonly screen recordings, not stills -- matches
 * the same URL-extension sniff `AdminMediaDropzone` and every other
 * project's showcase section already use, since the field itself
 * (`liveImageUrl`) can hold either an image or a video URL despite its
 * name. */
function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url);
}

/**
 * Scroll-linked wayfinding line -- this section's signature motion. A
 * dotted guide line runs behind the zone number badges; as the visitor
 * scrolls through the section, a solid blue line fills in behind it, same
 * idea as walking a numbered exhibition route.
 *
 * Draws an actual bent path (not a straight vertical) through each zone's
 * icon-badge center -- Joe's "折线" ask: 展區二 mirrors to the opposite
 * side on desktop, so the line has to tilt right then tilt back left
 * instead of running straight down. The path is built from real measured
 * icon positions (via `iconRefs`) rather than assumed fractions, since
 * zone heights differ a lot (Zone 1's scroll track alone can be several
 * viewport-heights tall) -- a fixed-fraction guess would put the bends in
 * the wrong place. This same measured path also still works unmodified on
 * mobile: `ZoneCard` only mirrors at `md:`, so on narrow screens every icon
 * measures out to the same left-side x and the "bent" path is just
 * straight again, with no separate mobile code path needed.
 *
 * `prefers-reduced-motion` keeps the bend (it's layout, not motion) but
 * skips the scroll-driven draw-in, showing the blue line fully drawn.
 */
function WayfindingLine({
  containerRef,
  iconRefs,
  zoneCount,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
  iconRefs: RefObject<(HTMLDivElement | null)[]>;
  zoneCount: number;
}) {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });
  const [path, setPath] = useState("");
  const [height, setHeight] = useState(0);

  useEffect(() => {
    function measure() {
      const container = containerRef.current;
      const icons = iconRefs.current;
      if (!container || icons.length < zoneCount || icons.slice(0, zoneCount).some((el) => !el)) return;

      const containerRect = container.getBoundingClientRect();
      const points = icons.slice(0, zoneCount).map((el) => {
        const r = el!.getBoundingClientRect();
        return { x: r.left + r.width / 2 - containerRect.left, y: r.top + r.height / 2 - containerRect.top };
      });

      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const cur = points[i];
        const midY = (prev.y + cur.y) / 2;
        d += ` C ${prev.x} ${midY}, ${cur.x} ${midY}, ${cur.x} ${cur.y}`;
      }
      setPath(d);
      setHeight(containerRect.height);
    }

    measure();
    // A second pass shortly after mount catches any late reflow (web font
    // swap, image aspect boxes settling) that would otherwise leave the
    // line's bends slightly off from the icons they're meant to connect.
    const t = setTimeout(measure, 300);
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [containerRef, iconRefs, zoneCount]);

  if (!path) return null;

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 w-full overflow-visible"
      style={{ height }}
    >
      <path
        d={path}
        fill="none"
        stroke="var(--color-grey-300)"
        strokeWidth={2}
        strokeDasharray="2 6"
        strokeLinecap="round"
      />
      <motion.path
        d={path}
        fill="none"
        stroke="var(--color-secondary-blue)"
        strokeWidth={2}
        strokeLinecap="round"
        style={reduceMotion ? { pathLength: 1 } : { pathLength: scrollYProgress }}
      />
    </svg>
  );
}

/** Zone 1's own left-rail step list (世界全覽 → 洲際聚焦 → 場次選擇 →
 * 演出詳情), ported from the original site's interactive stepper. On
 * mobile (and under `prefers-reduced-motion`) a step changes only by
 * tapping/clicking it. On desktop, `ScrollySteps` below drives `active`
 * from scroll position instead -- clicking still moves it immediately,
 * but the next scroll frame recomputes it from scroll position again, so
 * scrolling remains the primary driver, per Joe's "讓用戶不用自己點選" ask.
 * The inactive steps fade and shrink slightly (rather than just swapping
 * a static color) so the transition itself reads as the "動態效果" Joe
 * asked for, not just a instant label swap. */
function StepList({
  steps,
  active,
  onSelect,
  hint = "↓ scroll or click",
}: {
  steps: ZoneStep[];
  active: number;
  onSelect: (i: number) => void;
  hint?: string;
}) {
  return (
    <div>
      <p className="font-nunito mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-grey-400">{hint}</p>
      <ol className="space-y-0">
        {steps.map((step, i) => {
          const isActive = i === active;
          return (
            <li key={step.label} className="relative flex gap-3 border-l-2 border-grey-100 pl-4 pb-4 last:pb-0">
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-pressed={isActive}
                className="absolute -left-[7px] top-0.5 flex size-3 items-center justify-center rounded-full"
              >
                <span
                  className={`size-3 rounded-full border-2 transition-colors duration-300 ${
                    isActive ? "border-secondary-blue bg-secondary-blue" : "border-grey-300 bg-proj-white"
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={() => onSelect(i)}
                className={`origin-left text-left transition-all duration-300 ${
                  isActive ? "scale-100 opacity-100" : "scale-[0.97] opacity-60"
                }`}
              >
                <p className={`font-nunito text-[11px] font-extrabold tracking-[0.1em] ${isActive ? "text-secondary-blue" : "text-grey-400"}`}>
                  STEP {String(i + 1).padStart(2, "0")}
                </p>
                <p className={`font-nunito text-[15px] font-bold ${isActive ? "text-grey-800" : "text-grey-500"}`}>
                  {step.label}
                </p>
                {isActive && step.desc && (
                  <p className="font-nunito mt-1 max-w-[40ch] text-[13px] leading-[20px] font-normal text-grey-600">
                    {step.desc}
                  </p>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** macOS-style window chrome around a zone's Design/Live screenshot --
 * this project's own device frame for showing a kiosk screen mockup,
 * matching the traffic-light window treatment the original site used for
 * every zone. Kept local like Hero's `OperaHouseModel`, same shape family but a
 * flatter "browser window" rather than a bezeled touchscreen, since this
 * is for a 16:10-ish screenshot rather than the Hero's portrait kiosk. */
function DeviceFrame({ image, alt }: { image?: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-grey-100 bg-proj-white shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
      <div className="flex items-center gap-1.5 border-b border-grey-100 bg-grey-50 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
      </div>
      {/* `object-contain` rather than `object-cover` -- the real reference
       * screenshots aren't a uniform aspect ratio (Zone 2's crop is closer
       * to 4:5, Zone 1/3's closer to 3:2), and `cover` was silently cropping
       * content out of the taller ones. Contain + a neutral fill keeps the
       * whole screenshot visible regardless of its own aspect ratio. */}
      <div className="aspect-[3/2] w-full bg-grey-50">
        {image ? (
          isVideoUrl(image) ? (
            <video
              key={image}
              src={image}
              aria-label={alt}
              className="h-full w-full object-contain"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={image} src={image} alt={alt} className="h-full w-full object-contain" />
          )
        ) : (
          // Dashed border + icon, matching `MockupSlot`'s established
          // "media待上傳" convention rather than plain centered text, so an
          // empty slot reads as an intentional pending-upload state instead
          // of a broken image.
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-[10px] border-2 border-dashed border-grey-300 px-6 text-center">
            <ImageSquare size={28} weight="light" className="text-grey-400" />
            <p className="font-nunito text-[12px] font-bold leading-relaxed text-grey-400">此畫面製作中</p>
          </div>
        )}
      </div>
    </div>
  );
}

/** DESIGN / LIVE segmented toggle -- always rendered, even for a zone that
 * only has one side filled in so far (e.g. 展區三 currently has no Live
 * recording yet): switching to the empty side just shows `DeviceFrame`'s
 * own "此畫面製作中" placeholder, which is a legitimate state on its own
 * rather than something to hide the toggle for. Per Joe's reference
 * annotation, this sits as a floating badge OVERLAID on the device frame's
 * own bottom-right corner (see `ZoneCard`'s `relative` wrapper), not as a
 * separate element above it. */
function ModeToggle({
  mode,
  onChange,
}: {
  mode: "design" | "live";
  onChange: (m: "design" | "live") => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-grey-100 bg-proj-white p-1 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
      {(["design", "live"] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`font-nunito rounded-full px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.08em] transition-colors ${
            mode === m ? "bg-secondary-blue text-proj-white" : "text-grey-500 hover:text-grey-700"
          }`}
        >
          {m === "design" ? "Design" : "Live"}
        </button>
      ))}
    </div>
  );
}

/** The frame + its overlaid Design/Live toggle, shared by every zone
 * layout below -- `FRAME_WIDTH` keeps every zone's frame the same size
 * regardless of whether it shares its row with a step list. */
function FrameWithToggle({
  image,
  alt,
  mode,
  onModeChange,
}: {
  image?: string;
  alt: string;
  mode: "design" | "live";
  onModeChange: (m: "design" | "live") => void;
}) {
  return (
    <div className={`relative w-full ${FRAME_WIDTH}`}>
      <DeviceFrame image={image} alt={alt} />
      <div className="absolute bottom-3 right-3 z-10">
        <ModeToggle mode={mode} onChange={onModeChange} />
      </div>
    </div>
  );
}

function ZoneHeader({ zone, index }: { zone: Zone; index: number }) {
  return (
    <>
      <p className="font-nunito text-[12px] font-extrabold tracking-[0.1em] text-grey-400">
        展區 {String(index + 1).padStart(2, "0")}
      </p>
      <h4 className="font-nunito mt-1 text-[19px] font-bold leading-6 text-grey-800 md:text-[22px]">{zone.title}</h4>
      <p className="font-nunito mt-2 max-w-[60ch] text-[14px] leading-[22px] font-normal text-grey-600 md:text-[15px]">
        {zone.desc}
      </p>
    </>
  );
}

/** Zone 1's desktop-only scroll-driven stepper (世界全覽 → 洲際聚焦 →
 * 場次選擇 → 演出詳情), per Joe's "滾動時自動輪替，不需要用戶點選" ask: a
 * tall scroll track (`stepCount * 70vh`) holds the step list + frame
 * `sticky`-pinned on screen while the visitor scrolls through it, and
 * `scrollYProgress` through that track drives which step (and therefore
 * which Design screenshot) is active -- the same "pin a visual, scroll
 * drives state" pattern Piiluu's Hero already uses for its own one-shot
 * reveal, just continuous here instead of triggered once. Live mode stays
 * click-only regardless (the footage doesn't change per step), matching
 * Joe's explicit "live 則是用點選" call.
 *
 * Zone 1 is always the "normal" (non-mirrored) side of the zigzag, so its
 * text column stays first/left here unconditionally -- only `StaticZoneBody`
 * (used by Zone 2/3) needs the mirrored column order.
 *
 * `prefers-reduced-motion` skips the tall/sticky track altogether and
 * falls back to the same plain click-to-select layout mobile uses --
 * auto-advancing the screen around a visitor while they scroll is exactly
 * the kind of motion that preference exists to opt out of, same
 * precedent as Piiluu's Hero jumping straight to its settled state. */
function ScrollySteps({
  zone,
  index,
  mode,
  onModeChange,
}: {
  zone: Zone;
  index: number;
  mode: "design" | "live";
  onModeChange: (m: "design" | "live") => void;
}) {
  const steps = zone.steps!;
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(() => Math.min(1, steps.length - 1));
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActiveStep(Math.min(steps.length - 1, Math.max(0, Math.floor(v * steps.length))));
  });

  const designImage = steps[activeStep]?.designImageUrl;
  const image = mode === "design" ? designImage : zone.liveImageUrl;
  const alt = (mode === "design" ? steps[activeStep]?.label : zone.liveCaption) ?? zone.title;

  return (
    <div ref={trackRef} className="relative hidden md:block" style={{ height: `${steps.length * 70}vh` }}>
      <div className="sticky top-28 grid grid-cols-[0.8fr_1.2fr] gap-8 pb-16">
        <div>
          <ZoneHeader zone={zone} index={index} />
          <div className="mt-6">
            <StepList steps={steps} active={activeStep} onSelect={setActiveStep} hint="↓ 繼續往下捲動" />
          </div>
        </div>
        <FrameWithToggle image={image} alt={alt} mode={mode} onModeChange={onModeChange} />
      </div>
    </div>
  );
}

/** The plain click-to-select layout -- used for Zone 1 on mobile and under
 * `prefers-reduced-motion`, and unconditionally for Zone 2/3 (no step
 * list, no scroll-driven variant at all). Manages its own Design/Live +
 * step state locally rather than sharing `ZoneCard`'s, since this and
 * `ScrollySteps` are never visible at the same time.
 *
 * Text and frame share one responsive grid (`grid-cols-1` → single stacked
 * column on mobile, `md:grid-cols-[0.8fr_1.2fr]` side by side on desktop)
 * instead of the frame rendering full-width below the header -- that
 * stacked arrangement is exactly what made Zone 2/3 read as cramped (the
 * frame was squeezed into the same narrow column as the text, rather than
 * getting its own column). `mirrored` swaps which column each side lands
 * in via `order-*`, for the zigzag's one flipped zone; it only takes
 * effect at `md:`, so mobile (already a single stacked column with no
 * "narrow" problem to fix) never mirrors. */
function StaticZoneBody({ zone, index, mirrored }: { zone: Zone; index: number; mirrored: boolean }) {
  const hasSteps = Boolean(zone.steps && zone.steps.length > 0);
  const [mode, setMode] = useState<"design" | "live">(hasSteps || zone.designImageUrl ? "design" : "live");
  const [activeStep, setActiveStep] = useState(() => Math.min(1, (zone.steps?.length ?? 1) - 1));

  const designImage = hasSteps ? zone.steps?.[activeStep]?.designImageUrl : zone.designImageUrl;
  const image = mode === "design" ? designImage : zone.liveImageUrl;
  const alt = (mode === "design" ? zone.designCaption : zone.liveCaption) ?? zone.title;

  return (
    <div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr] md:items-start md:gap-8">
      <div className={mirrored ? "md:order-2" : ""}>
        <ZoneHeader zone={zone} index={index} />
        {hasSteps && zone.steps && (
          <div className="mt-6">
            <StepList steps={zone.steps} active={activeStep} onSelect={setActiveStep} />
          </div>
        )}
      </div>
      <div className={mirrored ? "md:order-1" : ""}>
        <FrameWithToggle image={image} alt={alt} mode={mode} onModeChange={setMode} />
      </div>
    </div>
  );
}

function ZoneCard({
  zone,
  index,
  iconRef,
}: {
  zone: Zone;
  index: number;
  iconRef: (el: HTMLDivElement | null) => void;
}) {
  const Icon = ZONE_ICONS[index] ?? ZONE_ICONS[0];
  const hasSteps = Boolean(zone.steps && zone.steps.length > 0);
  const reduceMotion = useReducedMotion();
  // Only `ScrollySteps` (Zone 1, desktop, motion-ok) needs this -- every
  // other path renders `StaticZoneBody`, which manages its own mode state.
  const [mode, setMode] = useState<"design" | "live">(zone.designImageUrl ? "design" : "live");

  // Zigzag wayfinding: the middle zone mirrors to the opposite side on
  // desktop (icon badge, title, and frame all flip across), then the next
  // zone flips back -- Joe's "折線" ask. Both icon and content flip
  // together via `flex-row-reverse` here, while `StaticZoneBody` flips its
  // own internal text/frame columns to match. Mobile never mirrors (see
  // `StaticZoneBody`'s comment).
  const mirrored = index % 2 === 1;

  return (
    <SlideIn
      delay={0.08 + index * 0.1}
      className={`relative flex gap-5 pl-0 md:gap-8 ${mirrored ? "md:flex-row-reverse" : ""}`}
    >
      <div
        ref={iconRef}
        className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-secondary-blue bg-proj-white text-secondary-blue md:size-16"
      >
        <Icon className="size-6 md:size-8" />
      </div>
      <div className="flex-1 pt-1">
        {hasSteps && !reduceMotion ? (
          <>
            <div className="md:hidden">
              <StaticZoneBody zone={zone} index={index} mirrored={false} />
            </div>
            <ScrollySteps zone={zone} index={index} mode={mode} onModeChange={setMode} />
          </>
        ) : (
          <StaticZoneBody zone={zone} index={index} mirrored={mirrored} />
        )}
      </div>
    </SlideIn>
  );
}

/**
 * Section 4 -- Exhibition Zones (`process` row's `zones`, the "NTSO case"
 * shape the generic SectionBlock renderer already special-cases). Grey-50
 * background like Context, continuing the white/grey alternation.
 */
export function ExhibitionZones({ process }: { process: Record<string, unknown> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const note = process.note as string | undefined;
  const zones = Array.isArray(process.zones) ? (process.zones as Zone[]) : [];

  if (zones.length === 0) return null;

  return (
    <section className="bg-grey-50 px-6 py-16 md:px-[120px] md:py-24">
      <div className="mx-auto flex max-w-[1000px] flex-col gap-10 md:gap-14">
        <SlideIn className="flex flex-col items-center gap-3 text-center">
          <SectionKicker color="blue" icon={null}>PROCESS</SectionKicker>
          <h2 className="font-nunito text-[20px] font-bold text-grey-800 md:text-[36px]">三大展區設計</h2>
          {note && (
            <p className="font-nunito max-w-[65ch] text-[15px] leading-[24px] font-normal text-grey-700 md:text-[18px] md:leading-[28px]">
              {note}
            </p>
          )}
        </SlideIn>

        <div ref={containerRef} className="relative">
          <WayfindingLine containerRef={containerRef} iconRefs={iconRefs} zoneCount={zones.length} />
          {/* Spacing between zones lives here as a `gap`, not as a
           * `pb-*`/`last:pb-0` pair on each card -- that previous approach
           * never actually worked: `last:pb-0` resolves to `:last-child`,
           * which is scoped to the card's OWN two-item row (icon + content),
           * so the content div was always that row's last child and the
           * padding was zeroed on every zone, not just the final one. A
           * `gap` on this shared flex column spaces every card evenly and
           * skips the trailing gap after the last one for free. */}
          <div className="flex flex-col gap-24 md:gap-40">
            {zones.map((zone, i) => (
              <ZoneCard
                key={zone.title}
                zone={zone}
                index={i}
                iconRef={(el) => {
                  iconRefs.current[i] = el;
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
