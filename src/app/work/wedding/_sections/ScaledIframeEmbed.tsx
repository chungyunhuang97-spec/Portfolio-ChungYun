"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Embeds a live, fully-interactive site inside a small container without
 * squishing its layout. A plain `<iframe className="h-full w-full">` makes
 * the browser lay the embedded page out at the CONTAINER's actual pixel
 * width (e.g. ~220px here) rather than the ~375px mobile viewport it was
 * designed for -- that's what was overflowing/overlapping in the phone
 * frame. Instead this renders the iframe at its real `nativeWidth` /
 * `nativeHeight` (so the embedded page sees a normal phone-sized viewport
 * and lays out correctly) and CSS-scales the whole iframe down to fit
 * whatever size the container actually ends up at, measured live via
 * `ResizeObserver` since that size is responsive (not a fixed px value).
 * Click/scroll/tap all keep working through a scaled iframe -- the browser
 * adjusts hit-testing for the transform automatically.
 */
export function ScaledIframeEmbed({
  src,
  title,
  nativeWidth = 375,
  nativeHeight = 812,
}: {
  src: string;
  title: string;
  nativeWidth?: number;
  nativeHeight?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setScale(entry.contentRect.width / nativeWidth);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [nativeWidth]);

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      <iframe
        src={src}
        title={title}
        loading="lazy"
        className="absolute top-0 left-0 origin-top-left border-0"
        style={{ width: nativeWidth, height: nativeHeight, transform: `scale(${scale})` }}
      />
    </div>
  );
}
