"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

const HERO_VIDEO_SRC = "/hero/room-journey.mp4";
const HERO_POSTER_SRC = "/hero/room-journey-poster.jpg";
const SCROLL_VH = 400; // total scroll-track height, in viewport heights

interface CopyBeat {
  from: number;
  to: number;
  eyebrow?: string;
  title: string;
  body?: string;
}

const BEATS: CopyBeat[] = [
  {
    from: 0,
    to: 0.12,
    eyebrow: "PRODUCT DESIGNER — REMOTE",
    title: "黃崇耘",
    body: "Chung Yun Huang",
  },
  {
    from: 0.2,
    to: 0.34,
    eyebrow: "ABOUT ME",
    title: "行銷出身，設計思維。",
  },
  {
    from: 0.42,
    to: 0.56,
    eyebrow: "WELCOME",
    title: "Explore the work below.",
  },
];

export function ScrollHero({ tagline }: { tagline: string }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const beatRefs = useRef<Array<HTMLDivElement | null>>([]);
  const progressRef = useRef(0);
  const [durationReady, setDurationReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Load the video as a blob so `currentTime` seeking is smooth and fully
  // buffered — scroll-scrubbing needs true seekability, which byte-range
  // streaming from a static host doesn't reliably give us.
  useEffect(() => {
    if (reducedMotion) return;
    let cancelled = false;
    let objectUrl: string | null = null;

    fetch(HERO_VIDEO_SRC)
      .then((res) => res.blob())
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        if (videoRef.current) videoRef.current.src = objectUrl;
      })
      .catch(() => {
        // Fall back to direct src if the blob fetch fails for any reason.
        if (!cancelled && videoRef.current) videoRef.current.src = HERO_VIDEO_SRC;
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onLoaded = () => setDurationReady(true);
    video.addEventListener("loadedmetadata", onLoaded);
    return () => video.removeEventListener("loadedmetadata", onLoaded);
  }, []);

  useEffect(() => {
    if (reducedMotion || !durationReady) return;
    let rafId: number;

    function onScroll() {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      progressRef.current = Math.min(1, Math.max(0, total > 0 ? scrolled / total : 0));
    }

    function tick() {
      const video = videoRef.current;
      if (video && video.duration) {
        const targetTime = progressRef.current * video.duration;
        // Ease toward the scroll-derived target instead of snapping —
        // keeps the playback feeling like footage, not a slideshow.
        video.currentTime += (targetTime - video.currentTime) * 0.2;
      }

      const p = progressRef.current;
      const fadeMargin = 0.04;
      beatRefs.current.forEach((el, i) => {
        if (!el) return;
        const beat = BEATS[i];
        let opacity = 0;
        if (p >= beat.from && p <= beat.to) {
          const fadeIn = Math.min(1, (p - beat.from) / fadeMargin);
          const fadeOut = Math.min(1, (beat.to - p) / fadeMargin);
          opacity = Math.min(fadeIn, fadeOut);
        }
        el.style.opacity = String(opacity);
      });

      rafId = requestAnimationFrame(tick);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [reducedMotion, durationReady]);

  if (reducedMotion) {
    return (
      <section className="relative flex min-h-[100dvh] items-center overflow-hidden bg-bg-inverse">
        <Image
          src={HERO_POSTER_SRC}
          alt=""
          fill
          priority
          className="object-cover opacity-70"
        />
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 py-24 md:px-10">
          <p className="text-xs tracking-[0.25em] text-white/70">PRODUCT DESIGNER — REMOTE</p>
          <h1 className="mt-4 text-4xl leading-none tracking-tight text-white md:text-6xl">
            黃崇耘
            <span className="block text-2xl font-normal text-white/70 md:text-3xl">
              Chung Yun Huang
            </span>
          </h1>
          <p className="mt-8 max-w-[52ch] text-lg leading-relaxed text-white/80">{tagline}</p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <a
              href="mailto:chungyunhuang97@gmail.com"
              className="group inline-flex items-center gap-2 border-b border-white/60 pb-1 text-sm tracking-wide text-white transition-colors hover:border-white"
            >
              Get in touch
              <ArrowUpRight size={16} weight="light" />
            </a>
            <a
              href="#work"
              className="inline-flex items-center gap-2 text-sm tracking-wide text-white/70 transition-colors hover:text-white"
            >
              View case studies
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative" style={{ height: `${SCROLL_VH}vh` }}>
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden bg-black">
        <video
          ref={videoRef}
          poster={HERO_POSTER_SRC}
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/40" />

        {BEATS.map((beat, i) => (
          <div
            key={beat.title}
            ref={(el) => {
              beatRefs.current[i] = el;
            }}
            className="pointer-events-none absolute inset-0 flex flex-col justify-end px-6 pb-20 opacity-0 md:px-10 md:pb-28"
          >
            <div className="mx-auto w-full max-w-[1400px]">
              {beat.eyebrow && (
                <p className="text-xs tracking-[0.25em] text-white/80">{beat.eyebrow}</p>
              )}
              <h2 className="mt-4 max-w-2xl text-3xl leading-tight text-white md:text-6xl">
                {beat.title}
              </h2>
              {beat.body && <p className="mt-2 text-lg text-white/80">{beat.body}</p>}
              {i === 0 && (
                <div className="pointer-events-auto mt-8 flex flex-wrap items-center gap-6">
                  <a
                    href="mailto:chungyunhuang97@gmail.com"
                    className="group inline-flex items-center gap-2 border-b border-white/60 pb-1 text-sm tracking-wide text-white transition-colors hover:border-white"
                  >
                    Get in touch
                    <ArrowUpRight size={16} weight="light" />
                  </a>
                  <a
                    href="#work"
                    className="inline-flex items-center gap-2 text-sm tracking-wide text-white/70 transition-colors hover:text-white"
                  >
                    View case studies
                  </a>
                </div>
              )}
              {i === 0 && tagline && (
                <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-white/70 md:text-lg">
                  {tagline}
                </p>
              )}
            </div>
          </div>
        ))}

        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] text-white/50">
          SCROLL
        </div>
      </div>
    </section>
  );
}
