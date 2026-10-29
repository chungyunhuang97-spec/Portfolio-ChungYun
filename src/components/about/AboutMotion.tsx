"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { aboutMotion as M, enterRotationFor } from "@/lib/motion.config";

gsap.registerPlugin(ScrollTrigger);

const FINE_POINTER = "(hover: hover) and (pointer: fine) and (min-width: 768px)";

/** Groups character spans into rendered lines by their vertical position. */
function groupLines(chars: HTMLElement[]): HTMLElement[][] {
  const lines: HTMLElement[][] = [];
  let top = Number.NaN;
  for (const ch of chars) {
    if (lines.length === 0 || Math.abs(ch.offsetTop - top) > 4) {
      lines.push([]);
      top = ch.offsetTop;
    }
    lines[lines.length - 1].push(ch);
  }
  return lines;
}

/**
 * Motion for the server-rendered AboutSection, mounted inside it:
 * - Statement: characters fill from 30% to 100% with scroll (scrub) on
 *   desktop/tablet with a mouse; phones/touch fade it in line by line.
 *   Each highlight word's marker stroke draws as the fill reaches it.
 * - Portrait slides up and rotates into place, then the star sticker pops.
 * - Trait cards paste in like stickers (Bento poster paste, half the tilt).
 * - Stats count up from 0, once.
 * Everything is visible in the markup; hidden starting states are only
 * applied here, and only for parts still below the trigger line, so a
 * reload or anchor jump past the section shows the final state. Reduced
 * motion or `enabled=false` leaves the section untouched (fully lit).
 */
export function AboutMotion({ enabled }: { enabled: boolean }) {
  const anchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = anchorRef.current?.closest("section");
    if (!section || !enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const fine = window.matchMedia(FINE_POINTER).matches;
    const threshold = fine ? M.enterThreshold.desktop : M.enterThreshold.mobile;
    const q = gsap.utils.selector(section);
    /** True when `el` is already above its trigger line (skip its entrance). */
    const passed = (el: Element, fraction = 1 - threshold) =>
      el.getBoundingClientRect().top < window.innerHeight * fraction;

    const ctx = gsap.context(() => {
      // ---- Statement fill + highlighter ----
      const heading = q<HTMLElement>("#about-heading")[0];
      const chars = q<HTMLElement>("#about-heading [data-char]");
      const strokes = q<SVGPathElement>("[data-highlight-stroke]");
      /** Index of the last character each stroke sits under. */
      const strokeAt = strokes.map((stroke) => {
        const last = stroke.closest("span")?.querySelectorAll("[data-char]");
        const lastChar = last?.[last.length - 1];
        return lastChar ? chars.indexOf(lastChar as HTMLElement) : chars.length - 1;
      });

      if (heading && chars.length > 0) {
        if (fine) {
          gsap.set(chars, { opacity: M.statement.dimOpacity });
          // Hidden until drawn: an undrawn stroke still shows its round cap.
          gsap.set(strokes, { strokeDashoffset: 1, opacity: 0 });
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: heading,
              start: M.statement.start,
              end: M.statement.end,
              scrub: M.statement.scrub,
            },
          });
          tl.to(chars, { opacity: 1, duration: 1, stagger: 1, ease: "none" }, 0);
          strokes.forEach((stroke, i) => {
            tl.set(stroke, { opacity: 1 }, strokeAt[i]);
            tl.to(stroke, { strokeDashoffset: 0, duration: 3, ease: "none" }, strokeAt[i]);
          });
        } else if (!passed(heading)) {
          const lines = groupLines(chars);
          gsap.set(chars, { opacity: 0, y: M.statement.lines.fromY });
          gsap.set(strokes, { strokeDashoffset: 1, opacity: 0 });
          ScrollTrigger.create({
            trigger: heading,
            start: `top ${(1 - threshold) * 100}%`,
            once: true,
            onEnter: () => {
              const tl = gsap.timeline();
              lines.forEach((line, i) =>
                tl.to(line, { opacity: 1, y: 0, duration: M.statement.lines.duration, ease: M.statement.lines.ease }, i * M.statement.lines.stagger)
              );
              tl.set(strokes, { opacity: 1 });
              tl.to(strokes, { strokeDashoffset: 0, duration: M.highlighter.duration, ease: M.highlighter.ease, stagger: 0.15 });
            },
          });
        }
      }

      // ---- Portrait + sticker ----
      const photo = q<HTMLElement>("[data-about-photo]")[0];
      const sticker = q<HTMLElement>("[data-about-sticker]")[0];
      if (photo && !passed(photo)) {
        const rotation = fine ? M.photo.fromRotation : M.photo.fromRotation / 2;
        gsap.set(photo, { opacity: 0, y: M.photo.fromY, rotation });
        if (sticker) gsap.set(sticker, { scale: 0 });
        ScrollTrigger.create({
          trigger: photo,
          start: `top ${(1 - threshold) * 100}%`,
          once: true,
          onEnter: () => {
            gsap.to(photo, {
              opacity: 1,
              y: 0,
              rotation: 0,
              duration: M.photo.duration,
              ease: M.photo.ease,
              clearProps: "transform,opacity",
            });
            if (sticker) {
              gsap.to(sticker, {
                keyframes: { scale: [0, 1.2, 1] },
                duration: M.sticker.duration,
                delay: M.sticker.delay,
                ease: M.sticker.ease,
                clearProps: "transform",
              });
            }
          },
        });
      }

      // ---- Trait stickers ----
      const traits = q<HTMLElement>("[data-about-trait]");
      if (traits.length > 0 && !passed(traits[0], 0.85)) {
        traits.forEach((t, i) =>
          gsap.set(t, {
            opacity: 0,
            y: M.traits.fromY,
            scale: M.traits.fromScale,
            rotation: enterRotationFor(i, null) * M.traits.rotationScale,
          })
        );
        ScrollTrigger.create({
          trigger: traits[0],
          start: "top 85%",
          once: true,
          onEnter: () =>
            gsap.to(traits, {
              opacity: 1,
              y: 0,
              scale: 1,
              rotation: 0,
              duration: M.traits.duration,
              stagger: M.traits.stagger,
              ease: M.traits.ease,
              // CSS owns the hover lift afterwards.
              clearProps: "transform,opacity",
            }),
        });
      }

      // ---- Stats count-up ----
      const stats = q<HTMLElement>("[data-about-stats]")[0];
      const values = q<HTMLElement>("[data-stat-value]");
      if (stats && values.length > 0 && !passed(stats, 0.9)) {
        values.forEach((el) => (el.textContent = "0"));
        ScrollTrigger.create({
          trigger: stats,
          start: "top 90%",
          once: true,
          onEnter: () =>
            values.forEach((el) => {
              const target = Number(el.dataset.statValue);
              const counter = { n: 0 };
              gsap.to(counter, {
                n: target,
                duration: M.stats.duration,
                ease: M.stats.ease,
                onUpdate: () => {
                  el.textContent = String(Math.round(counter.n));
                },
              });
            }),
        });
      }
    }, section);

    return () => {
      ctx.revert();
      // ctx.revert() restores styles, not text: put the real numbers back.
      section.querySelectorAll<HTMLElement>("[data-stat-value]").forEach((el) => {
        el.textContent = el.dataset.statValue ?? el.textContent;
      });
    };
  }, [enabled]);

  return <span ref={anchorRef} hidden />;
}
