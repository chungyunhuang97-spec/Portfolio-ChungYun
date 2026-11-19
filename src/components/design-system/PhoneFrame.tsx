"use client";

import { motion, useReducedMotion } from "framer-motion";
import { WifiHigh, CellSignalFull, BatteryFull } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Reusable iPhone-style device frame for App Mockup slots across every
 * project page. Renders real device chrome (bezel, notch, status bar) so
 * the layout looks finished even before the actual screen-recording /
 * screenshot asset is wired in — pass `screen` to fill it with real
 * content (an <Image>/<video>) later; omit it to fall back to a soft
 * placeholder pattern.
 */
export function PhoneFrame({
  screen,
  label = "App 畫面（後臺可上傳影片或圖片）",
  float = false,
  className = "",
}: {
  screen?: ReactNode;
  label?: string;
  float?: boolean;
  className?: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  // Outer width/height ratio that makes the SCREEN area exactly match the
  // uploaded media, so a recording that isn't 375:812 is neither cropped
  // (object-cover) nor letter-boxed. null = use the default 375:812 body.
  const [fitAspect, setFitAspect] = useState<number | null>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const media = frame?.querySelector<HTMLVideoElement | HTMLImageElement>("video, img");
    if (!frame || !media) {
      setFitAspect(null);
      return;
    }

    const BORDER = 16; // 8px each side
    function update() {
      if (!frame || !media) return;
      const natW = media instanceof HTMLVideoElement ? media.videoWidth : media.naturalWidth;
      const natH = media instanceof HTMLVideoElement ? media.videoHeight : media.naturalHeight;
      if (!natW || !natH) return;
      const screenAspect = natW / natH;
      // Only phone-shaped media adapts; a landscape image keeps the default body.
      if (screenAspect < 0.3 || screenAspect > 0.8) return setFitAspect(null);
      const width = frame.getBoundingClientRect().width;
      if (width <= BORDER) return;
      const next = width / ((width - BORDER) / screenAspect + BORDER);
      setFitAspect((prev) => (prev !== null && Math.abs(prev - next) < 0.0005 ? prev : next));
    }

    update();
    const loadEvent = media instanceof HTMLVideoElement ? "loadedmetadata" : "load";
    media.addEventListener(loadEvent, update);
    const observer = new ResizeObserver(update);
    observer.observe(frame);
    return () => {
      media.removeEventListener(loadEvent, update);
      observer.disconnect();
    };
    // `screen` is a fresh element each render, so this re-binds to whatever
    // <video>/<img> is currently inside the frame.
  }, [screen]);

  const frame = (
    <div
      ref={frameRef}
      style={fitAspect ? { aspectRatio: fitAspect } : undefined}
      className={`relative aspect-[375/812] w-full overflow-hidden rounded-[2.5rem] border-[8px] border-primary-black bg-proj-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] ${className}`}
    >
      {/* status bar */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 pt-2 text-primary-black">
        <span className="font-nunito text-[11px] font-bold">9:41</span>
        <div className="flex items-center gap-1">
          <CellSignalFull size={13} weight="fill" />
          <WifiHigh size={13} weight="fill" />
          <BatteryFull size={16} weight="fill" />
        </div>
      </div>
      {/* notch */}
      <div className="absolute left-1/2 top-0 z-10 h-[22px] w-[90px] -translate-x-1/2 rounded-b-2xl bg-primary-black" />

      {/* screen content — real screenshots/video go edge-to-edge (no padding,
          object-cover already applied by the caller); only the placeholder
          text gets the centered padding treatment */}
      {screen ? (
        <div className="absolute inset-0">{screen}</div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-grey-50 px-6 pt-9 text-center">
          <p className="font-nunito text-[11px] font-bold leading-relaxed text-grey-500">
            {label}
          </p>
        </div>
      )}
    </div>
  );

  const reduceMotion = useReducedMotion();

  if (!float || reduceMotion) return frame;

  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      {frame}
    </motion.div>
  );
}
