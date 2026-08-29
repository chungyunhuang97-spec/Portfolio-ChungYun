"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

export interface StaggeredMenuItem {
  label: string;
  ariaLabel: string;
  link: string;
}

export interface StaggeredMenuProps {
  open: boolean;
  onRequestClose: () => void;
  items: StaggeredMenuItem[];
  position?: "left" | "right";
  /** Colors for the layers that wipe in behind the panel before it arrives. */
  colors?: string[];
  accentColor?: string;
  displayItemNumbering?: boolean;
  closeOnClickAway?: boolean;
}

/**
 * Controlled fork of react-bits' StaggeredMenu (ts-tailwind variant,
 * https://github.com/DavidHDev/react-bits/blob/main/src/ts-tailwind/Components/StaggeredMenu/StaggeredMenu.tsx).
 *
 * The upstream component ships its own header/hamburger/logo/socials and
 * drives `open` internally off its own toggle button. Per Joe's ask, the
 * Navbar's existing trigger (the hamburger button with its scroll-aware
 * show/hide behavior, and the "Chung Yun" wordmark) stays exactly as-is —
 * only the panel that opens is swapped for this component's color-wipe +
 * staggered-item-reveal treatment. So this fork keeps just the GSAP
 * timeline/prelayer/panel logic and drops the header, icon, text-cycling,
 * logo, and socials entirely; `open` is now a controlled prop instead of
 * internal state.
 */
export function StaggeredMenu({
  open,
  onRequestClose,
  items,
  position = "right",
  colors = ["var(--color-grey-900)", "var(--color-primary-orange)"],
  accentColor = "var(--color-primary-orange)",
  displayItemNumbering = true,
  closeOnClickAway = true,
}: StaggeredMenuProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const preLayersRef = useRef<HTMLDivElement | null>(null);
  const preLayerElsRef = useRef<HTMLElement[]>([]);

  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);
  const busyRef = useRef(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;
      if (!panel) return;

      let preLayers: HTMLElement[] = [];
      if (preContainer) {
        preLayers = Array.from(preContainer.querySelectorAll(".sm-prelayer")) as HTMLElement[];
      }
      preLayerElsRef.current = preLayers;

      const offscreen = position === "left" ? -100 : 100;
      gsap.set([panel, ...preLayers], { xPercent: offscreen, opacity: 1 });
      if (preContainer) gsap.set(preContainer, { xPercent: 0, opacity: 1 });
    });
    return () => ctx.revert();
  }, [position]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    closeTweenRef.current?.kill();
    closeTweenRef.current = null;

    const itemEls = Array.from(panel.querySelectorAll(".sm-panel-itemLabel")) as HTMLElement[];
    const numberEls = Array.from(
      panel.querySelectorAll(".sm-panel-list[data-numbering] .sm-panel-item")
    ) as HTMLElement[];

    const offscreen = position === "left" ? -100 : 100;

    if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });
    if (numberEls.length) gsap.set(numberEls, { "--sm-num-opacity": 0 } as gsap.TweenVars);

    const tl = gsap.timeline({ paused: true });

    layers.forEach((el, i) => {
      tl.fromTo(el, { xPercent: offscreen }, { xPercent: 0, duration: 0.5, ease: "power4.out" }, i * 0.07);
    });

    const lastTime = layers.length ? (layers.length - 1) * 0.07 : 0;
    const panelInsertTime = lastTime + (layers.length ? 0.08 : 0);
    const panelDuration = 0.65;

    tl.fromTo(
      panel,
      { xPercent: offscreen },
      { xPercent: 0, duration: panelDuration, ease: "power4.out" },
      panelInsertTime
    );

    if (itemEls.length) {
      const itemsStart = panelInsertTime + panelDuration * 0.15;
      tl.to(
        itemEls,
        { yPercent: 0, rotate: 0, duration: 1, ease: "power4.out", stagger: { each: 0.1, from: "start" } },
        itemsStart
      );
      if (numberEls.length) {
        tl.to(
          numberEls,
          { duration: 0.6, ease: "power2.out", "--sm-num-opacity": 1, stagger: { each: 0.08, from: "start" } } as gsap.TweenVars,
          itemsStart + 0.1
        );
      }
    }

    openTlRef.current = tl;
    return tl;
  }, [position]);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback("onComplete", () => {
        busyRef.current = false;
      });
      tl.play(0);
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;

    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    const offscreen = position === "left" ? -100 : 100;
    closeTweenRef.current?.kill();
    closeTweenRef.current = gsap.to([...layers, panel], {
      xPercent: offscreen,
      duration: 0.32,
      ease: "power3.in",
      overwrite: "auto",
      onComplete: () => {
        const itemEls = Array.from(panel.querySelectorAll(".sm-panel-itemLabel")) as HTMLElement[];
        if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });
        const numberEls = Array.from(
          panel.querySelectorAll(".sm-panel-list[data-numbering] .sm-panel-item")
        ) as HTMLElement[];
        if (numberEls.length) gsap.set(numberEls, { "--sm-num-opacity": 0 } as gsap.TweenVars);
        busyRef.current = false;
      },
    });
  }, [position]);

  useEffect(() => {
    if (open) playOpen();
    else playClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!closeOnClickAway || !open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onRequestClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeOnClickAway, open, onRequestClose]);

  const layerColors = (() => {
    const arr = colors.slice(0, 4);
    if (arr.length >= 3) arr.splice(Math.floor(arr.length / 2), 1);
    return arr;
  })();

  return (
    <div
      className="sm-scope pointer-events-none fixed inset-0 z-40 h-screen w-screen overflow-hidden"
      style={{ "--sm-accent": accentColor } as React.CSSProperties}
      data-position={position}
      aria-hidden={!open}
    >
      <div ref={preLayersRef} className="sm-prelayers pointer-events-none absolute top-0 right-0 bottom-0 z-[5]" aria-hidden="true">
        {layerColors.map((c, i) => (
          <div key={i} className="sm-prelayer absolute top-0 right-0 h-full w-full translate-x-0" style={{ background: c }} />
        ))}
      </div>

      <aside
        ref={panelRef}
        className="staggered-menu-panel bg-proj-white pointer-events-auto absolute top-0 right-0 z-10 flex h-full flex-col overflow-y-auto p-8 pt-28"
      >
        <ul className="sm-panel-list m-0 flex list-none flex-col gap-2 p-0" role="list" data-numbering={displayItemNumbering || undefined}>
          {items.map((it, idx) => (
            <li key={it.label + idx} className="sm-panel-itemWrap relative overflow-hidden leading-none">
              <a
                className="sm-panel-item font-nunito relative inline-block cursor-pointer pr-[1.4em] text-[40px] leading-none font-extrabold tracking-tight text-primary-black uppercase transition-colors"
                href={it.link}
                aria-label={it.ariaLabel}
                data-index={idx + 1}
                onClick={onRequestClose}
              >
                <span className="sm-panel-itemLabel inline-block [transform-origin:50%_100%] will-change-transform">{it.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </aside>

      <style>{`
.sm-scope .sm-panel-itemWrap { position: relative; overflow: hidden; line-height: 1; }
.sm-scope .sm-panel-itemLabel { display: inline-block; will-change: transform; transform-origin: 50% 100%; }
.sm-scope .sm-panel-item:hover { color: var(--sm-accent, var(--color-primary-orange)); }
.sm-scope .sm-panel-list[data-numbering] { counter-reset: smItem; }
.sm-scope .sm-panel-list[data-numbering] .sm-panel-item::after {
  counter-increment: smItem;
  content: counter(smItem, decimal-leading-zero);
  position: absolute;
  top: 0.15em;
  right: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--sm-accent, var(--color-primary-orange));
  letter-spacing: 0;
  pointer-events: none;
  user-select: none;
  opacity: var(--sm-num-opacity, 0);
}
      `}</style>
    </div>
  );
}
