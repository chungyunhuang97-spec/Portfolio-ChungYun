"use client";

import { useRef, useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { DoodleSplat } from "@/components/design-system/doodles";
import type { Project, ProjectGridSettings } from "@/lib/types";
import { BentoCard } from "./BentoCard";
import { useProjectsChoreography } from "./useProjectsChoreography";

const EYEBROW = "01 / SELECTED WORK";
const HEADING = "Projects";

/**
 * Homepage "Selected Work" Bento grid. Card order, size, theme and
 * visibility all come from the admin (`display_order` / `card_size` /
 * `card_theme` / `is_visible`); nothing about placement is hardcoded here.
 *
 * Everything renders in its final, visible state on the server -- the
 * choreography hook only hides things once JS has decided an entrance
 * will actually play, so no-JS visitors always see the full grid.
 */
export function ProjectsSection({
  projects,
  settings,
}: {
  projects: Project[];
  settings: ProjectGridSettings;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const starRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"static" | "flight">("static");

  useProjectsChoreography({
    sectionRef,
    starRef,
    enabled: settings.enable_scroll_choreography,
    mode,
    onModeChange: setMode,
  });

  return (
    <section
      id="work"
      ref={sectionRef}
      className="relative scroll-mt-20 bg-cream pt-16 pb-20 md:pt-20 md:pb-28"
      style={{
        paddingLeft: "max(16px, env(safe-area-inset-left))",
        paddingRight: "max(16px, env(safe-area-inset-right))",
      }}
    >
      {mode === "flight" && (
        <>
          {/* Orange carries the Hero's color down until the star lands,
              then the cream ripple (clip-path circle) wipes it away. */}
          <div data-bg-orange aria-hidden className="absolute inset-0 bg-primary-orange" />
          <div
            data-bg-ripple
            aria-hidden
            className="absolute inset-0 bg-cream"
            style={{ clipPath: "circle(0px at 50% 50%)" }}
          />
          <div
            ref={starRef}
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 z-[5] text-secondary-blue"
          >
            <div data-star-bounce className="h-full w-full">
              <div className="h-full w-full motion-safe:animate-[star-idle_7s_ease-in-out_infinite]">
                <DoodleSplat className="h-full w-full drop-shadow-[0_8px_20px_rgba(13,33,255,0.25)]" />
              </div>
            </div>
          </div>
        </>
      )}

      <div className="relative mx-auto w-full max-w-[1400px] md:px-6 wide:max-w-[1600px]">
        <header className="mb-8 desk:mb-8">
          <p
            data-heading-eyebrow
            className="font-nunito text-[11px] font-extrabold tracking-[0.25em] text-secondary-blue md:text-[13px]"
          >
            {EYEBROW}
          </p>
          <h2
            aria-label={HEADING}
            className="mt-3 font-fredoka text-[56px] leading-[0.95] text-grey-900 md:text-[80px] desk:text-[88px]"
          >
            {HEADING.split("").map((char, i) => (
              <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                <span data-heading-letter className="inline-block font-fredoka">
                  {char}
                </span>
              </span>
            ))}
          </h2>
        </header>

        {projects.length === 0 ? (
          <p className="text-sm text-grey-700">
            尚未有已發布的案例 — 在後台把專案設成 published 並勾選首頁顯示即可出現在這裡。
          </p>
        ) : (
          <div className="bento-grid">
            {projects.map((project, index) => (
              <BentoCard key={project.id} project={project} index={index} />
            ))}

            <div data-decor className="bento-cell relative">
              <a
                href={settings.decor_cell_link}
                className="group flex h-full min-h-[140px] items-center justify-between gap-4 rounded-[var(--radius-card)] px-5 py-4 text-grey-900 outline-offset-4 focus-visible:outline-3 focus-visible:outline-secondary-blue desk:flex-col desk:items-start desk:rounded-[var(--radius-card-lg)] md:min-h-0"
              >
                <span
                  data-star-slot
                  aria-hidden
                  className="block aspect-square h-[92px] shrink-0 text-secondary-blue md:h-[96px] desk:h-auto desk:w-[46%] desk:max-w-[150px]"
                >
                  <DoodleSplat
                    data-star-slot-art
                    className="h-full w-full drop-shadow-[0_8px_20px_rgba(13,33,255,0.25)]"
                  />
                </span>
                <span
                  data-decor-label
                  className="inline-flex min-h-11 items-center gap-2 font-fredoka text-2xl leading-tight underline-offset-4 group-hover:underline desk:text-[26px]"
                >
                  {settings.decor_cell_label}
                  <ArrowUpRight size={22} weight="bold" aria-hidden />
                </span>
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
