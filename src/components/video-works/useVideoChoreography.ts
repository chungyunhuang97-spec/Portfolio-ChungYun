"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { videoMotion as M } from "@/lib/motion.config";

gsap.registerPlugin(ScrollTrigger);

type InMode = "shuffle" | "mobile" | "fade";

interface CardEls {
  shell: HTMLElement;
  inner: HTMLElement;
  index: number;
  /** Local x (inside the scaled shell) that puts the card on the stage center. */
  toCenter: number;
}

function cardEls(stage: HTMLElement): CardEls[] {
  const stageBox = stage.getBoundingClientRect();
  const center = stageBox.left + stageBox.width / 2;
  return [...stage.querySelectorAll<HTMLElement>("[data-video-card]")].map((shell) => {
    const box = shell.getBoundingClientRect();
    const scale = shell.offsetWidth ? box.width / shell.offsetWidth : 1;
    return {
      shell,
      inner: shell.querySelector<HTMLElement>("[data-card-inner]")!,
      index: Number(shell.dataset.videoCard),
      toCenter: (center - (box.left + box.width / 2)) / (scale || 1),
    };
  });
}

/**
 * Video Works motion on top of VideoWorksSection's React state:
 * - Entrance (once, when the section crosses the trigger line): the blue
 *   film-strip overlay wipes off left to right, the cards start as a
 *   stacked deck and deal outwards (phones: slide in from the right), the
 *   selected card settles last and its play icon pops, the category list
 *   slides in top to bottom.
 * - Category switch: `runCategorySwitch(apply)` collapses the deck to the
 *   middle and flips it to its back, calls `apply` (the state change),
 *   then flips the new deck in and deals it out (<=700ms). Phones fade out
 *   -> in with a small shift; reduced motion / choreography off: a 200ms
 *   opacity cross-fade.
 * The fan arc for switching videos inside a category is plain CSS
 * (transitions on the card shells), not handled here.
 */
export function useVideoChoreography({
  sectionRef,
  stageRef,
  infoRef,
  overlayRef,
  enabled,
  isPhone,
  measured,
  catIndex,
  videoIndex,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  stageRef: RefObject<HTMLDivElement | null>;
  infoRef: RefObject<HTMLDivElement | null>;
  overlayRef: RefObject<HTMLDivElement | null>;
  enabled: boolean;
  isPhone: boolean;
  measured: boolean;
  catIndex: number;
  videoIndex: number;
}) {
  const entered = useRef(false);
  const busy = useRef(false);
  const pendingIn = useRef<InMode | null>(null);
  const videoIndexRef = useRef(videoIndex);

  useEffect(() => {
    videoIndexRef.current = videoIndex;
  }, [videoIndex]);

  const choreo = useCallback(
    () => enabled && !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [enabled]
  );

  // ---- Entrance ----
  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const overlay = overlayRef.current;
    if (entered.current || !measured || !section || !stage) return;
    entered.current = true;
    if (!choreo()) return;

    const threshold = isPhone ? M.enterThreshold.mobile : M.enterThreshold.desktop;
    // Arrived with the section already on screen: show the final state.
    if (section.getBoundingClientRect().top < window.innerHeight * (1 - threshold)) return;

    const ctx = gsap.context(() => {
      const cards = cardEls(stage);
      const selected = videoIndexRef.current;
      const tabs = section.querySelectorAll<HTMLElement>("[role=tab]");
      const play = stage.querySelector<HTMLElement>("[data-play-icon]");

      if (overlay) overlay.hidden = false;
      if (isPhone) {
        gsap.set(cards.map((c) => c.inner), { x: M.deal.mobile.fromX, opacity: 0 });
      } else {
        cards.forEach((c, k) =>
          gsap.set(c.inner, {
            x: c.toCenter,
            y: (c.index - selected) * -M.deal.stackOffsetY,
            rotation: (k % 2 ? -1 : 1) * M.deal.stackRotation * (1 + (k % 3) * 0.5),
          })
        );
      }
      if (play) gsap.set(play, { scale: 0 });
      gsap.set(tabs, { opacity: 0, x: M.categories.fromX });

      ScrollTrigger.create({
        trigger: section,
        start: `top ${(1 - threshold) * 100}%`,
        once: true,
        onEnter: () => {
          const tl = gsap.timeline();
          if (overlay) {
            tl.to(overlay, { xPercent: 101, duration: M.wipe.duration, ease: M.wipe.ease }, 0);
            tl.add(() => {
              overlay.hidden = true;
            });
          }
          if (isPhone) {
            tl.to(
              cards.map((c) => c.inner),
              { x: 0, opacity: 1, duration: M.deal.mobile.duration, stagger: M.deal.mobile.stagger, ease: M.deal.mobile.ease },
              M.deal.delay
            );
          } else {
            // Neighbours fan out nearest-first; the selected card settles last.
            const order = cards
              .filter((c) => c.index !== selected)
              .sort((a, b) => Math.abs(a.index - selected) - Math.abs(b.index - selected));
            order.forEach((c, k) =>
              tl.to(
                c.inner,
                { x: 0, y: 0, rotation: 0, duration: M.deal.duration, ease: M.deal.ease },
                M.deal.delay + k * M.deal.stagger
              )
            );
            const sel = cards.find((c) => c.index === selected);
            if (sel) {
              const at = M.deal.delay + order.length * M.deal.stagger;
              tl.to(sel.inner, { x: 0, y: 0, rotation: 0, duration: M.deal.duration, ease: M.deal.ease }, at);
              tl.fromTo(
                sel.inner,
                { scale: M.deal.settle.from },
                { scale: 1, duration: M.deal.settle.duration, ease: M.deal.settle.ease },
                at + M.deal.duration * 0.6
              );
            }
          }
          if (play) tl.to(play, { scale: 1, duration: M.deal.playPop.duration, ease: M.deal.playPop.ease, clearProps: "transform" });
          tl.to(
            tabs,
            { opacity: 1, x: 0, duration: M.categories.duration, stagger: M.categories.stagger, ease: M.categories.ease, clearProps: "transform,opacity" },
            M.deal.delay
          );
        },
      });
    }, section);
    return () => ctx.revert();
    // Runs once, after the stage has been measured.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measured]);

  // ---- Category switch ----
  const runCategorySwitch = useCallback(
    (apply: () => void) => {
      const stage = stageRef.current;
      const info = infoRef.current;
      if (busy.current || !stage) return;
      const panels = [stage, info].filter(Boolean) as HTMLElement[];

      if (!choreo()) {
        busy.current = true;
        gsap.to(panels, {
          opacity: 0,
          duration: M.reduced.duration / 2,
          onComplete: () => {
            pendingIn.current = "fade";
            apply();
          },
        });
        return;
      }
      busy.current = true;
      if (isPhone) {
        gsap.to(panels, {
          opacity: 0,
          y: -M.shuffle.mobile.shiftY,
          duration: M.shuffle.mobile.out,
          onComplete: () => {
            pendingIn.current = "mobile";
            apply();
          },
        });
        return;
      }
      const cards = cardEls(stage);
      gsap.to(
        cards.map((c) => c.inner),
        {
          x: (i) => cards[i].toCenter,
          rotationY: 90,
          transformPerspective: 900,
          duration: M.shuffle.out.duration,
          ease: M.shuffle.out.ease,
          onComplete: () => {
            pendingIn.current = "shuffle";
            apply();
          },
        }
      );
      if (info) gsap.to(info, { opacity: 0, duration: M.shuffle.out.duration });
    },
    [choreo, isPhone, stageRef, infoRef]
  );

  // After the new category renders: play the matching "in" half.
  useLayoutEffect(() => {
    const mode = pendingIn.current;
    const stage = stageRef.current;
    const info = infoRef.current;
    const section = sectionRef.current;
    if (!mode || !stage) return;
    pendingIn.current = null;
    const panels = [stage, info].filter(Boolean) as HTMLElement[];
    const done = () => {
      busy.current = false;
    };

    if (mode === "fade") {
      gsap.fromTo(panels, { opacity: 0 }, { opacity: 1, duration: M.reduced.duration / 2, clearProps: "opacity", onComplete: done });
      return;
    }
    if (mode === "mobile") {
      gsap.fromTo(
        panels,
        { opacity: 0, y: M.shuffle.mobile.shiftY },
        { opacity: 1, y: 0, duration: M.shuffle.mobile.in, clearProps: "opacity,transform", onComplete: done }
      );
      return;
    }

    const cards = cardEls(stage);
    gsap.fromTo(
      cards.map((c) => c.inner),
      { x: (i) => cards[i].toCenter, rotationY: -90, transformPerspective: 900 },
      {
        x: 0,
        rotationY: 0,
        duration: M.shuffle.in.duration,
        stagger: M.shuffle.in.stagger,
        ease: M.shuffle.in.ease,
        clearProps: "transform",
        onComplete: done,
      }
    );
    if (info) {
      gsap.set(info, { opacity: 1 });
      const chars = info.querySelectorAll("[data-title-char]");
      gsap.fromTo(chars, { yPercent: 110 }, { yPercent: 0, duration: M.shuffle.titleChars.duration, stagger: M.shuffle.titleChars.stagger, ease: M.shuffle.titleChars.ease });
    }
    const counter = section?.querySelector("[data-counter-num]");
    if (counter) {
      gsap.fromTo(
        counter,
        { rotationX: -90, transformPerspective: 300 },
        { rotationX: 0, duration: M.shuffle.counter.duration, ease: M.shuffle.counter.ease, clearProps: "transform" }
      );
    }
  }, [catIndex, stageRef, infoRef, sectionRef]);

  return { runCategorySwitch };
}
