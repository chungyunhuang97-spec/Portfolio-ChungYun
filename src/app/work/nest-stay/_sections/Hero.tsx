"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { DisplayHero, BodyLarge, LabelSmall } from "@/components/design-system/Typography";
import { Tag } from "@/components/design-system/Tag";
import { PhoneFrame } from "@/components/design-system/PhoneFrame";
import { SlideIn } from "@/components/design-system/SlideIn";
import type { Project } from "@/lib/types";

function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url);
}

/**
 * Desktop-only ±2° mouse-tracking parallax tilt on the phone mockup, per the
 * interaction spec ("桌面版 Mockup 有輕微視差傾斜效果（±2°），手機版停用"). Reuses
 * the same iPhone-frame component every other project's Hero uses
 * (<PhoneFrame />), so this only wraps it with a motion transform -- no
 * layout/paint-triggering properties, rotateX/rotateY only. Explicitly not
 * mounted inside the mobile block below.
 */
function TiltMockup({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 20 });
  const springY = useSpring(y, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [2, -2]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-2, 2]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Section 1 — Hero (Figma desktop node 275:87 / mobile node 404:147). Same
 * structural pattern as metro's Hero.tsx (kicker/title/body/phone mockup,
 * two structurally distinct mobile/desktop blocks per the project's
 * established convention), extended with the two fields nest-stay's Figma
 * adds on top: `timeframeLabel` (small meta line under the title) and
 * `badges` (3 status chips, reusing <Tag variant="orange"> exactly like
 * metro's Hero chips rather than inventing a new chip style).
 *
 * Entrance motion: the interaction spec asks for a staggered fade+rise
 * (0.12s stagger, 0.6s duration, cubic-bezier(0.16,1,0.3,1)) rather than
 * metro's spring-based SlideIn. Implemented as a small local variants
 * object driving kicker → title → body → badges → mockup, reusing SlideIn
 * only for the mockup's own scroll-independent entrance (delay chained off
 * the same stagger). Mobile drops the badges row to keep the section inside
 * one viewport, matching metro's own mobile simplification precedent.
 */
const EASE_SPEC: [number, number, number, number] = [0.16, 1, 0.3, 1];

const heroContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const heroItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_SPEC } },
};

export function Hero({
  project,
  hero,
}: {
  project: Project;
  hero: Record<string, unknown>;
}) {
  const kicker = (hero.kicker as string) || project.category || "UI/UX DESIGN PROJECT";
  const title = (hero.title as string) ?? project.title;
  const body = project.subtitle ?? "";
  const timeframeLabel = hero.timeframeLabel as string | undefined;
  const badges = Array.isArray(hero.badges) ? (hero.badges as string[]) : [];
  const mediaUrl = (hero.mockup_media_url as string) || undefined;

  const screen = mediaUrl ? (
    isVideoUrl(mediaUrl) ? (
      <video src={mediaUrl} autoPlay loop muted playsInline className="h-full w-full object-cover" />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={mediaUrl} alt={title} className="h-full w-full object-cover" />
    )
  ) : undefined;

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-proj-white px-6 pt-[104px] pb-16 md:flex md:min-h-screen md:items-center md:px-[176px] md:py-0"
    >
      {/* Mobile layout — no tilt (spec: disabled on mobile), badges dropped */}
      <motion.div
        className="flex flex-col md:hidden"
        variants={heroContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={heroItem}>
          <LabelSmall className="text-primary-orange">{kicker}</LabelSmall>
          <DisplayHero className="mt-2 text-primary-black">{title}</DisplayHero>
          {timeframeLabel && (
            <p className="font-nunito mt-1 text-[13px] font-semibold text-grey-500">{timeframeLabel}</p>
          )}
        </motion.div>

        <motion.div variants={heroItem} className="mx-auto mt-8 w-[62%] max-w-[240px]">
          <PhoneFrame screen={screen} float />
        </motion.div>

        <motion.div variants={heroItem}>
          <BodyLarge className="mt-8 text-center text-grey-600">{body}</BodyLarge>
        </motion.div>
      </motion.div>

      {/* Desktop layout — ±2° parallax tilt on the mockup */}
      <motion.div
        className="hidden w-full items-center justify-between gap-x-20 md:flex"
        variants={heroContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={heroItem} className="w-[749px] shrink-0">
          <LabelSmall className="text-primary-orange">{kicker}</LabelSmall>
          <DisplayHero className="mt-5 text-primary-black">{title}</DisplayHero>
          {timeframeLabel && (
            <p className="font-nunito mt-2 text-[15px] font-semibold text-grey-500">{timeframeLabel}</p>
          )}
          <BodyLarge className="mt-5 max-w-[610px] text-grey-600">{body}</BodyLarge>
          {badges.length > 0 && (
            <motion.div variants={heroItem} className="mt-5 flex flex-wrap gap-3">
              {badges.map((badge) => (
                <Tag key={badge} variant="outline">
                  {badge}
                </Tag>
              ))}
            </motion.div>
          )}
        </motion.div>

        <motion.div variants={heroItem} className="w-[259px] shrink-0">
          <SlideIn direction="right" delay={0}>
            <TiltMockup>
              <PhoneFrame screen={screen} float />
            </TiltMockup>
          </SlideIn>
        </motion.div>
      </motion.div>
    </section>
  );
}
