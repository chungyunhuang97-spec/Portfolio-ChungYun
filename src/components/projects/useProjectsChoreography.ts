"use client";

import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { enterRotationFor, projectsMotion as M } from "@/lib/motion.config";

gsap.registerPlugin(ScrollTrigger);

type Mode = "static" | "flight";

/** Full choreography needs a real pointer and the 12-column grid. */
const FLIGHT_QUERY =
  "(hover: hover) and (pointer: fine) and (min-width: 1024px) and (min-height: 500px)";
const DESKTOP_QUERY = "(min-width: 1024px) and (min-height: 500px)";

function rectWithin(el: Element, container: Element) {
  const r = el.getBoundingClientRect();
  const c = container.getBoundingClientRect();
  return { x: r.left - c.left, y: r.top - c.top, w: r.width, h: r.height };
}

/**
 * Hero -> Projects choreography ("Star Drop") plus the secondary motion
 * (number flip, decoration draw, heading mask, cover parallax).
 *
 * - Flight mode (desktop + fine pointer): the Hero's splat is swapped for
 *   a traveling copy that scrubs (GSAP ScrollTrigger) into the DECOR cell,
 *   lands with a bounce, ripples the section from orange to cream, then
 *   the cards "poster paste" in, nearest to the star first.
 * - Static mode (mobile/touch/tablet): no flight; the DECOR star spins in
 *   place and cards slide+fade in when the section enters the viewport.
 * - Reduced motion or `enabled=false`: opacity-only fade, <=200ms.
 * - Arriving with the section already on screen (anchor link, reload
 *   further down): every entrance is skipped, final state shown.
 *
 * Initial hidden states are only ever applied from here, never in CSS,
 * so the grid is fully visible without JS. Nothing sets pointer-events,
 * so cards stay clickable mid-animation. Entrances play once.
 */
export function useProjectsChoreography({
  sectionRef,
  starRef,
  enabled,
  mode,
  onModeChange,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  starRef: RefObject<HTMLDivElement | null>;
  enabled: boolean;
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}) {
  // Survives the static -> flight re-render so entrances never replay.
  const revealedRef = useRef(false);

  // Decide the mode once on mount; flight mode renders the star/background
  // layers, so the timeline effect below waits for that re-render.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (enabled && !reduced && window.matchMedia(FLIGHT_QUERY).matches) onModeChange("flight");
  }, [enabled, onModeChange]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const choreo = enabled && !reduced;
    const isDesktop = window.matchMedia(DESKTOP_QUERY).matches;
    const wantsFlight = choreo && window.matchMedia(FLIGHT_QUERY).matches;
    // First pass of a flight-mode page: wait for the star to render.
    if (wantsFlight && (mode !== "flight" || !starRef.current)) return;

    ScrollTrigger.config({ ignoreMobileResize: true });
    const q = gsap.utils.selector(section);
    const cells = q<HTMLElement>("[data-bento-cell]");
    const eyebrow = q<HTMLElement>("[data-heading-eyebrow]");
    const letters = q<HTMLElement>("[data-heading-letter]");
    const decorLabel = q<HTMLElement>("[data-decor-label]");
    const slot = section.querySelector<HTMLElement>("[data-star-slot]");
    const slotArt = section.querySelector<SVGElement>("[data-star-slot-art]");

    const threshold = isDesktop ? M.enterThreshold.desktop : M.enterThreshold.mobile;
    const alreadyOnScreen =
      section.getBoundingClientRect().top < window.innerHeight * (1 - threshold);
    const skipEntrances = revealedRef.current || alreadyOnScreen;

    const ctx = gsap.context(() => {
      // ---- Cover parallax (Desktop/Wide only, independent of entrance) ----
      if (choreo && isDesktop) {
        const travel = (M.coverParallax / 2) * 100;
        q<HTMLElement>("[data-cover-parallax]").forEach((el) => {
          gsap.fromTo(
            el,
            { yPercent: -travel },
            {
              yPercent: travel,
              ease: "none",
              scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
            }
          );
        });
      }

      // ---- Reduced motion / choreography disabled ----
      if (!choreo) {
        if (skipEntrances) return;
        const targets = [...eyebrow, ...letters, ...cells, ...decorLabel];
        gsap.set(targets, { opacity: 0 });
        ScrollTrigger.create({
          trigger: section,
          start: `top ${(1 - threshold) * 100}%`,
          once: true,
          onEnter: () => {
            revealedRef.current = true;
            gsap.to(targets, { opacity: 1, duration: M.reduced.duration, ease: "none" });
          },
        });
        return;
      }

      const flight = mode === "flight" && wantsFlight;
      const star = starRef.current;

      // ---- Entrance pieces ----
      function hideAll() {
        gsap.set(eyebrow, { opacity: 0 });
        gsap.set(letters, { yPercent: 110 });
        gsap.set(decorLabel, { opacity: 0 });
        cells.forEach((cell, i) => {
          if (flight) {
            const override = cell.dataset.enterRotation;
            gsap.set(cell, {
              opacity: 0,
              y: M.posterPaste.fromY,
              scale: M.posterPaste.fromScale,
              rotation: enterRotationFor(i, override ? Number(override) : null),
            });
          } else {
            gsap.set(cell, { opacity: 0, y: M.posterPaste.mobile.fromY });
          }
          const num = cell.querySelector("[data-card-number]");
          if (num) {
            gsap.set(num, flight ? { rotationX: -90, transformPerspective: 400, transformOrigin: "50% 50% -0.3em" } : { yPercent: 105 });
          }
          cell.querySelectorAll<HTMLElement>("[data-decoration]").forEach(prepDecoration);
        });
      }

      function prepDecoration(el: HTMLElement) {
        if (el.dataset.decoration === "pop") {
          gsap.set(el, { scale: 0, rotation: -90 });
          return;
        }
        el.querySelectorAll<SVGGeometryElement>("path").forEach((p) => {
          const len = p.getTotalLength();
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        });
        gsap.set(el.querySelectorAll("circle"), { opacity: 0 });
      }

      function playDecoration(el: HTMLElement, at: number, tl: gsap.core.Timeline) {
        if (el.dataset.decoration === "pop") {
          tl.to(el, { scale: 1, rotation: 0, duration: M.decoration.pop.duration, ease: M.decoration.pop.ease }, at);
          return;
        }
        tl.to(el.querySelectorAll("path"), { strokeDashoffset: 0, duration: M.decoration.draw.duration, ease: M.decoration.draw.ease }, at);
        tl.to(el.querySelectorAll("circle"), { opacity: 1, duration: 0.2 }, at + M.decoration.draw.duration * 0.6);
      }

      /** Cards in paste order: nearest to the star (DECOR cell) first. */
      function orderedCells() {
        if (!slot) return cells;
        const s = slot.getBoundingClientRect();
        const sx = s.left + s.width / 2;
        const sy = s.top + s.height / 2;
        return [...cells].sort((a, b) => {
          const ra = a.getBoundingClientRect();
          const rb = b.getBoundingClientRect();
          const da = Math.hypot(ra.left + ra.width / 2 - sx, ra.top + ra.height / 2 - sy);
          const db = Math.hypot(rb.left + rb.width / 2 - sx, rb.top + rb.height / 2 - sy);
          return da - db;
        });
      }

      function revealAll(startAt = 0) {
        revealedRef.current = true;
        const tl = gsap.timeline({ delay: startAt });
        tl.to(eyebrow, { opacity: 1, duration: M.heading.eyebrow.duration, ease: M.heading.eyebrow.ease }, 0);
        tl.to(letters, { yPercent: 0, duration: M.heading.letters.duration, stagger: M.heading.letters.stagger, ease: M.heading.letters.ease }, 0.1);

        const paste = flight ? M.posterPaste : M.posterPaste.mobile;
        orderedCells().forEach((cell, i) => {
          const at = 0.15 + i * paste.stagger;
          tl.to(
            cell,
            flight
              ? { opacity: 1, y: 0, scale: 1, rotation: 0, duration: paste.duration, ease: paste.ease }
              : { opacity: 1, y: 0, duration: paste.duration, ease: paste.ease },
            at
          );
          const num = cell.querySelector("[data-card-number]");
          if (num) {
            const cfg = flight ? M.numberFlip : M.maskReveal;
            tl.to(num, flight ? { rotationX: 0, duration: cfg.duration, ease: cfg.ease } : { yPercent: 0, duration: cfg.duration, ease: cfg.ease }, at + 0.2);
          }
          cell.querySelectorAll<HTMLElement>("[data-decoration]").forEach((el) =>
            playDecoration(el, at + M.decoration.delay, tl)
          );
        });
        tl.to(decorLabel, { opacity: 1, duration: 0.3 }, 0.3);
        // Leave no inline transforms behind so CSS hover/focus own the cards.
        tl.add(() => gsap.set(cells, { clearProps: "transform,opacity" }));
        return tl;
      }

      if (!skipEntrances) hideAll();

      // ---- Static (mobile / touch / tablet) ----
      if (!flight) {
        if (skipEntrances) return;
        if (slotArt) gsap.set(slotArt, { scale: M.star.pop.fromScale, rotation: M.star.pop.fromRotation, opacity: 0, transformOrigin: "50% 50%" });
        ScrollTrigger.create({
          trigger: section,
          start: `top ${(1 - threshold) * 100}%`,
          once: true,
          onEnter: () => revealAll(),
        });
        if (slotArt && slot) {
          ScrollTrigger.create({
            trigger: slot,
            start: "top 90%",
            once: true,
            onEnter: () =>
              gsap.to(slotArt, { scale: 1, rotation: 0, opacity: 1, duration: M.star.pop.duration, ease: M.star.pop.ease }),
          });
        }
        return;
      }

      // ---- Flight ----
      const origin = document.querySelector<HTMLElement>("[data-star-origin]");
      const orange = section.querySelector<HTMLElement>("[data-bg-orange]");
      const ripple = section.querySelector<HTMLElement>("[data-bg-ripple]");
      if (!star || !origin || !slot) {
        if (!skipEntrances) revealAll();
        return;
      }
      document.documentElement.dataset.starDrop = "flight";
      if (slotArt) gsap.set(slotArt, { visibility: "hidden" });

      let from = { x: 0, y: 0, w: 1, h: 1 };
      let to = { x: 0, y: 0, w: 1, h: 1 };
      function measure() {
        // Origin (a ghost box in the Hero) and slot are both untransformed,
        // so these rects are stable regardless of scroll/animation state.
        from = rectWithin(origin!, section!);
        to = rectWithin(slot!, section!);
        gsap.set(star!, { left: from.x, top: from.y, width: from.w, height: from.h });
      }
      measure();

      let landed = skipEntrances;
      const hideBackground = () => gsap.set([orange, ripple].filter(Boolean), { display: "none" });
      if (landed) hideBackground();

      function land() {
        if (landed) return;
        landed = true;
        const bounce = star!.querySelector("[data-star-bounce]");
        gsap.fromTo(bounce, { scale: M.star.landBounce.from }, { scale: 1, duration: M.star.landBounce.duration, ease: M.star.landBounce.ease });
        const cx = to.x + to.w / 2;
        const cy = to.y + to.h / 2;
        const sw = section!.offsetWidth;
        const sh = section!.offsetHeight;
        const radius = Math.max(Math.hypot(cx, cy), Math.hypot(sw - cx, cy), Math.hypot(cx, sh - cy), Math.hypot(sw - cx, sh - cy));
        if (ripple) {
          gsap.fromTo(
            ripple,
            { clipPath: `circle(0px at ${cx}px ${cy}px)` },
            {
              clipPath: `circle(${radius}px at ${cx}px ${cy}px)`,
              duration: M.ripple.duration,
              ease: M.ripple.ease,
              onComplete: hideBackground,
            }
          );
        }
        revealAll(M.posterPaste.delayAfterLanding);
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 0,
          // Land once the DECOR cell is fully on screen, or when the section
          // reaches the top of the viewport, whichever comes first.
          end: () => {
            const sectionTop = section.getBoundingClientRect().top + window.scrollY;
            const s = slot.getBoundingClientRect();
            const cellBottom = s.bottom + window.scrollY + 32;
            return Math.max(1, Math.min(sectionTop, cellBottom - window.innerHeight));
          },
          scrub: M.star.scrub,
          invalidateOnRefresh: true,
          onRefreshInit: measure,
        },
        onUpdate: () => {
          if (tl.progress() >= 0.999) land();
        },
      });
      tl.fromTo(
        star,
        { x: 0, y: 0, scale: 1, rotation: 0 },
        {
          x: () => to.x + to.w / 2 - (from.x + from.w / 2),
          y: () => to.y + to.h / 2 - (from.y + from.h / 2),
          scale: () => to.w / from.w,
          rotation: M.star.flightRotation,
          ease: "power1.inOut",
          immediateRender: true,
        }
      );
    }, section);

    return () => {
      ctx.revert();
      delete document.documentElement.dataset.starDrop;
    };
  }, [sectionRef, starRef, enabled, mode]);
}
