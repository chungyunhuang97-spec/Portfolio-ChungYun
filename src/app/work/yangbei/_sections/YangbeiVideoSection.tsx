"use client";

import { motion } from "framer-motion";
import { SlideIn } from "@/components/design-system/SlideIn";
import { Check, FilmSlate } from "@phosphor-icons/react/dist/ssr";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: 16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE } },
};

/**
 * Recognizes a YouTube or Vimeo link and returns its embeddable iframe URL.
 * Anything else (an uploaded mp4/webm/mov, including a Supabase Storage URL
 * from AdminMediaDropzone) is treated as a direct, self-hosted video file.
 */
function toEmbedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/i);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

function VideoFrame({ videoUrl, label, color }: { videoUrl?: string; label: string; color: string }) {
  if (!videoUrl) {
    return (
      <div
        className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl"
        style={{ background: `linear-gradient(160deg, ${color}14 0%, ${color}05 100%)` }}
      >
        <FilmSlate size={32} weight="light" style={{ color: `${color}99` }} />
        <span className="font-nunito text-[13px] font-medium" style={{ color: `${color}99` }}>
          影片上傳中
        </span>
      </div>
    );
  }

  const embed = toEmbedUrl(videoUrl);

  if (embed) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
        <iframe
          src={embed}
          title={label}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
      <video src={videoUrl} controls muted loop playsInline className="h-full w-full object-contain" />
    </div>
  );
}

interface Props {
  index: "01" | "02" | "03";
  label: string;
  description: string;
  videoUrl?: string;
  highlights: string[];
  color: string;
  /** Mirrors the layout: video on the right, copy on the left. Used for
   * 中台 so the three sections alternate (左-右-左) down the page instead of
   * repeating the same side three times in a row. Mobile always stacks
   * video-then-copy regardless, per the RWD spec (影片寬度 100% on top). */
  reverse?: boolean;
}

/**
 * One reusable "視角" walkthrough: a 16:9 video (or upload placeholder) on
 * one side, its label/description/highlights on the other — alternating
 * sides across the three instances (see `reverse`). Each side slides in
 * from its own edge on scroll (SlideIn is whileInView-triggered), so the
 * video and the copy arrive from opposite directions instead of together.
 * Reused three times from page.tsx for 前台/中台/後台, each passed its own
 * copy, video URL and highlights so this component carries no
 * platform-specific content itself.
 */
export function YangbeiVideoSection({
  index,
  label,
  description,
  videoUrl,
  highlights,
  color,
  reverse = false,
}: Props) {
  return (
    <section
      className="overflow-hidden px-6 py-16 md:px-[120px] md:py-[80px]"
      style={{ background: `linear-gradient(180deg, ${color}12 0%, ${color}00 55%)` }}
    >
      <div
        className={`mx-auto flex max-w-[1200px] flex-col gap-8 md:items-center md:gap-14 ${
          reverse ? "md:flex-row-reverse" : "md:flex-row"
        }`}
      >
        <SlideIn
          direction={reverse ? "right" : "left"}
          viewportMargin="0px"
          className="w-full md:w-[56%] md:shrink-0"
        >
          <VideoFrame videoUrl={videoUrl} label={label} color={color} />
        </SlideIn>

        <SlideIn
          direction={reverse ? "left" : "right"}
          delay={0.1}
          viewportMargin="0px"
          className="w-full md:flex-1"
        >
          <div className="flex flex-col gap-4 md:gap-5">
            <span className="font-nunito text-[13px] font-extrabold tracking-[1px] uppercase" style={{ color }}>
              {index} — {label}
            </span>
            <p className="font-nunito text-[14px] leading-[22px] text-grey-600 md:text-[16px] md:leading-[26px]">
              {description}
            </p>

            {highlights.length > 0 && (
              <motion.ul
                className="flex flex-col gap-2.5 pt-1"
                variants={listVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              >
                {highlights.map((feat) => (
                  <motion.li
                    key={feat}
                    variants={itemVariants}
                    className="flex items-center gap-3 rounded-xl border border-grey-100 bg-grey-50 px-4 py-3"
                  >
                    <span
                      className="flex size-6 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${color}1A`, color }}
                      aria-hidden
                    >
                      <Check size={13} weight="bold" />
                    </span>
                    <span className="font-nunito text-[13px] font-medium text-primary-black md:text-[14px]">
                      {feat}
                    </span>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </div>
        </SlideIn>
      </div>
    </section>
  );
}
