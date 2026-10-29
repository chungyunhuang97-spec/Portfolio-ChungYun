"use client";

import { getImageProps } from "next/image";
import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { BadgeStatus, CardSize, CardTheme, Project } from "@/lib/types";
import { BentoDecoration } from "./BentoDecoration";

/**
 * Theme -> colors. Contrast checked against WCAG AA (ratios in comments):
 * cream-on-orange is only 2.8:1, so `red` cards use black type instead of
 * the Hero's cream.
 */
export const CARD_THEMES: Record<
  CardTheme,
  { card: string; muted: string; number: string; arrow: string; decoration: string }
> = {
  // ink on cream 15.6:1, grey-700 on cream 7.4:1
  cream: {
    card: "bg-cream text-grey-900 shadow-[inset_0_0_0_1.5px_rgba(23,23,22,0.12)]",
    muted: "text-grey-700",
    number: "text-secondary-blue",
    arrow: "bg-grey-900 text-cream",
    decoration: "text-primary-orange",
  },
  // cream on blue 6.8:1
  blue: {
    card: "bg-secondary-blue text-cream",
    muted: "text-cream/85",
    number: "text-cream",
    arrow: "bg-cream text-secondary-blue",
    decoration: "text-primary-orange",
  },
  // black on orange 6.5:1
  red: {
    card: "bg-primary-orange text-primary-black",
    muted: "text-primary-black",
    number: "text-primary-black",
    arrow: "bg-primary-black text-cream",
    decoration: "text-secondary-blue",
  },
  // ink on white 17.9:1, grey-700 on white 8.5:1, blue on white 7.8:1
  white: {
    card: "bg-proj-white text-grey-900 shadow-[inset_0_0_0_1.5px_rgba(23,23,22,0.08)]",
    muted: "text-grey-700",
    number: "text-secondary-blue",
    arrow: "bg-grey-900 text-cream",
    decoration: "text-secondary-blue",
  },
};

const BADGE_LABEL: Record<BadgeStatus, string> = {
  shipped: "Shipped",
  live: "Live",
  demo: "Demo",
  concept: "Concept",
};

/** next/image `sizes` per card size, matching the grid's column spans. */
const COVER_SIZES: Record<CardSize, string> = {
  large: "(min-width: 1024px) 50vw, 100vw",
  wide: "(min-width: 1024px) 30vw, (min-width: 768px) 46vw, 100vw",
  small: "(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw",
};

const MAX_TILT_DEG = 5;

function Cover({ project, eager }: { project: Project; eager: boolean }) {
  const desktopSrc = project.cover_image_url!;
  const common = {
    alt: project.cover_alt ?? "",
    fill: true,
    sizes: COVER_SIZES[project.card_size],
    loading: eager ? ("eager" as const) : ("lazy" as const),
    fetchPriority: eager ? ("high" as const) : undefined,
  };
  const { props: desktop } = getImageProps({ ...common, src: desktopSrc });
  const mobileSrc = project.cover_image_mobile;
  const mobile = mobileSrc ? getImageProps({ ...common, src: mobileSrc }).props : null;

  return (
    <picture>
      {mobile && <source media="(max-width: 767px)" srcSet={mobile.srcSet} sizes={mobile.sizes} />}
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt comes from getImageProps */}
      <img {...desktop} className="object-cover" />
    </picture>
  );
}

export function BentoCard({ project, index }: { project: Project; index: number }) {
  const theme = CARD_THEMES[project.card_theme];
  const number = String(index + 1).padStart(2, "0");
  const hasCover = Boolean(project.cover_image_url);
  const meta = [project.role, project.category, project.year].filter(Boolean).join(" · ");
  const tagLimit = project.card_size === "small" ? 2 : project.max_tags_on_card;
  const tags = project.tags.slice(0, Math.max(0, tagLimit));
  const outcome = project.outcome ?? project.subtitle;

  const linkRef = useRef<HTMLAnchorElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoRequested, setVideoRequested] = useState(false);

  function canHover() {
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }

  function handlePointerEnter(e: PointerEvent<HTMLAnchorElement>) {
    if (e.pointerType !== "mouse" || !project.hover_preview_video || !canHover()) return;
    // The clip is only fetched on first hover; touch devices never request it.
    if (!videoRequested) setVideoRequested(true);
    else videoRef.current?.play().catch(() => {});
  }

  function handlePointerMove(e: PointerEvent<HTMLAnchorElement>) {
    if (e.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = linkRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--rx", `${(-py * MAX_TILT_DEG).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(px * MAX_TILT_DEG).toFixed(2)}deg`);
  }

  function handlePointerLeave() {
    linkRef.current?.style.removeProperty("--rx");
    linkRef.current?.style.removeProperty("--ry");
    videoRef.current?.pause();
  }

  return (
    <div
      data-bento-cell
      data-size={project.card_size}
      data-enter-rotation={project.enter_rotation ?? undefined}
      className="bento-cell relative"
      style={{ "--hover-rot": index % 2 === 0 ? "-0.6deg" : "0.6deg" } as CSSProperties}
    >
      <a
        ref={linkRef}
        href={`/work/${project.slug}`}
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className={`bento-card relative ${theme.card}`}
      >
        <div data-size={project.card_size} className="bento-layout">
          <div className="bento-cover">
            {hasCover ? (
              <>
                <div className="bento-cover-zoom absolute inset-0">
                  <div data-cover-parallax className="absolute inset-x-0 -top-[4%] -bottom-[4%]">
                    <Cover project={project} eager={project.card_size === "large"} />
                  </div>
                </div>
                {videoRequested && project.hover_preview_video && (
                  <video
                    ref={videoRef}
                    src={project.hover_preview_video}
                    muted
                    loop
                    playsInline
                    autoPlay
                    aria-hidden
                    className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 [.bento-card:hover_&]:opacity-100"
                  />
                )}
                <span
                  className={`absolute left-4 top-4 inline-flex overflow-hidden rounded-full px-3 py-1 font-fredoka text-xl leading-none ${theme.card}`}
                >
                  <span data-card-number className="inline-block">
                    {number}
                  </span>
                </span>
              </>
            ) : (
              <span
                aria-hidden
                className={`bento-number-giant absolute bottom-[-0.14em] left-[0.06em] font-fredoka leading-none ${theme.number}`}
              >
                <span data-card-number className="inline-block">
                  {number}
                </span>
              </span>
            )}
          </div>

          <div className="bento-body">
            {/* Font class on a span: the global unlayered h1-h4 rule in
                globals.css beats Tailwind's layered utilities on headings. */}
            <h3 className="bento-title leading-[1.1] line-clamp-2">
              {!hasCover && <span className="sr-only">{number} </span>}
              <span className="font-fredoka">{project.title}</span>
            </h3>
            {project.title_en && (
              <p
                data-desk-optional
                className={`mt-1 font-nunito text-xs font-bold tracking-[0.12em] uppercase line-clamp-1 ${theme.muted}`}
              >
                {project.title_en}
              </p>
            )}
            {outcome && (
              <p
                data-desk-optional
                className={`mt-2 font-nunito text-sm leading-snug line-clamp-2 ${theme.muted}`}
              >
                {outcome}
              </p>
            )}
            {(meta || project.badge_status) && (
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                {project.badge_status && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-current px-2.5 py-0.5 font-nunito text-[11px] font-extrabold tracking-[0.12em] uppercase">
                    {project.badge_status === "live" && (
                      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
                    )}
                    {BADGE_LABEL[project.badge_status]}
                  </span>
                )}
                {meta && (
                  <p className={`font-nunito text-xs font-bold tracking-wide ${theme.muted}`}>{meta}</p>
                )}
              </div>
            )}
            {tags.length > 0 && (
              <ul className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1">
                {tags.map((tag) => (
                  <li key={tag} className={`font-nunito text-[11px] tracking-[0.15em] uppercase ${theme.muted}`}>
                    {tag}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <span
          aria-hidden
          className={`bento-arrow absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full ${theme.arrow}`}
        >
          <ArrowUpRight size={20} weight="bold" />
        </span>

        {project.decoration !== "none" && (
          <BentoDecoration
            decoration={project.decoration}
            position={project.decoration_position}
            animate={project.animate_decoration}
            className={theme.decoration}
          />
        )}
      </a>
    </div>
  );
}
