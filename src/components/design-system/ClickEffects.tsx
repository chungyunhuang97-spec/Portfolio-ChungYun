"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";

/**
 * Global click-feedback layer (ported from Originkit's "Click Effects",
 * `sniper` mode) — a small crosshair-and-scatter burst at every click,
 * reading as a precise/technical brand touch across the whole site.
 *
 * Mounted once in the root layout, fixed to the viewport, `pointer-events:
 * none` throughout so it never intercepts real clicks. Skips itself on
 * `/admin` routes — Joe uses those as his own CMS, and a ripple firing on
 * every table row / form field click there would just be noise, not a
 * site-visitor-facing flourish.
 */
type Sniper = { id: string; x: number; y: number };

const SNIPER_ANGLES = [
  Math.PI / 3,
  (2 * Math.PI) / 3,
  (4 * Math.PI) / 3,
  (5 * Math.PI) / 3,
  Math.PI / 6,
  (5 * Math.PI) / 6,
  (7 * Math.PI) / 6,
  (11 * Math.PI) / 6,
];

const COLOR = "var(--color-primary-orange)";
const DURATION = 0.4;
const STROKE_WIDTH = 2;
const EFFECT_SIZE = 90;

export function ClickEffects() {
  const pathname = usePathname();
  const [snipers, setSnipers] = useState<Sniper[]>([]);
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) return;
    const handleClick = (e: MouseEvent) => {
      const id = `${e.timeStamp}-${Math.round(e.clientX)}-${Math.round(e.clientY)}`;
      setSnipers((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [isAdmin]);

  if (isAdmin) return null;

  const svgStyle = (x: number, y: number): CSSProperties => ({
    position: "fixed",
    left: x - EFFECT_SIZE / 2,
    top: y - EFFECT_SIZE / 2,
    width: EFFECT_SIZE,
    height: EFFECT_SIZE,
    pointerEvents: "none",
    overflow: "visible",
  });

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[200]">
      {snipers.map((sniper) => (
        <div key={sniper.id}>
          <svg
            style={svgStyle(sniper.x, sniper.y)}
            ref={(el) => {
              if (!el) return;
              const lines = el.querySelectorAll("line");
              lines.forEach((line, index) => {
                const angle = [0, 90, 180, 270][index] * (Math.PI / 180);
                const centerX = EFFECT_SIZE / 2;
                const centerY = EFFECT_SIZE / 2;
                const lineLength = EFFECT_SIZE * 0.2;
                const startX = centerX + 5 * Math.cos(angle);
                const startY = centerY - 5 * Math.sin(angle);
                const endX = centerX + (5 + lineLength) * Math.cos(angle);
                const endY = centerY - (5 + lineLength) * Math.sin(angle);
                gsap.set(line, { attr: { x1: startX, y1: startY, x2: endX, y2: endY }, strokeWidth: STROKE_WIDTH });
                gsap
                  .timeline()
                  .to(line, {
                    attr: { x1: endX, y1: endY, x2: endX, y2: endY },
                    translateX: (5 + lineLength) * Math.cos(angle),
                    translateY: -(5 + lineLength) * Math.sin(angle),
                    duration: DURATION,
                    ease: "power2.out",
                  })
                  .to(line, { strokeWidth: 0, duration: DURATION * 0.4, ease: "linear" }, DURATION * 0.6);
              });
            }}
          >
            {[0, 90, 180, 270].map((_, index) => {
              const c = EFFECT_SIZE / 2;
              return <line key={index} x1={c} y1={c} x2={c} y2={c} stroke={COLOR} strokeWidth={STROKE_WIDTH} strokeLinecap="square" />;
            })}
          </svg>
          {SNIPER_ANGLES.map((angle, index) => (
            <div
              key={index}
              style={{
                position: "fixed",
                left: sniper.x - STROKE_WIDTH / 2,
                top: sniper.y - STROKE_WIDTH / 2,
                width: STROKE_WIDTH,
                height: STROKE_WIDTH,
                backgroundColor: COLOR,
                pointerEvents: "none",
              }}
              ref={(el) => {
                if (!el || el.dataset.animated) return;
                el.dataset.animated = "true";
                gsap.set(el, { x: 0, y: 0, width: STROKE_WIDTH, height: STROKE_WIDTH });
                gsap
                  .timeline()
                  .to(el, {
                    x: Math.cos(angle) * (EFFECT_SIZE * 0.4),
                    y: Math.sin(angle) * (EFFECT_SIZE * 0.4),
                    duration: DURATION,
                    ease: "power2.out",
                    onComplete: () => setSnipers((prev) => prev.filter((s) => s.id !== sniper.id)),
                  })
                  .to(el, { width: 0, height: 0, duration: DURATION * 0.4, ease: "linear" }, DURATION * 0.6);
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
