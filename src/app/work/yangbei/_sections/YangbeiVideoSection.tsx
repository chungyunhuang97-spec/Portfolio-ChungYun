"use client";

import { motion } from "framer-motion";
import { SlideIn } from "@/components/design-system/SlideIn";
import { CaretDown, Check, FilmSlate } from "@phosphor-icons/react/dist/ssr";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.35 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: 16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE } },
};

/** Eyebrow → big title → description, staggered so the title gets its own
 * beat (a spring "pop") instead of arriving flattened into the same fade as
 * everything around it — the one piece of text this section most wants the
 * eye to land on first. */
const headerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const eyebrowVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

const titleVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.94 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 170, damping: 15 },
  },
};

const descVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
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
        className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl border shadow-[0px_8px_12px_rgba(64,50,42,0.06),0px_1.5px_1.5px_rgba(64,50,42,0.04)]"
        style={{
          background: `linear-gradient(160deg, ${color}26 0%, ${color}0D 100%)`,
          borderColor: `${color}1F`,
        }}
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
  /** A one-line narrative bridge from whatever came before, shown at the
   * top of this same section (same background, same color identity)
   * instead of as a separate grey band sandwiched between two differently
   * -tinted sections — that previous standalone-card version read as an
   * abrupt interruption rather than part of the chapter it was leading
   * into. */
  transitionText?: string;
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
  transitionText,
}: Props) {
  return (
    <section
      className="flex min-h-[100dvh] flex-col justify-center overflow-hidden px-6 py-16 md:px-[120px] md:py-[80px]"
      style={{ backgroundColor: `${color}0D` }}
    >
      {transitionText && (
        <SlideIn viewportMargin="0px" className="mx-auto mb-10 w-full max-w-[640px] md:mb-14">
          <div className="flex flex-col items-center gap-3 text-center">
            <p
              className="font-nunito text-[16px] leading-[26px] font-semibold italic md:text-[20px] md:leading-[30px]"
              style={{ color: `${color}CC` }}
            >
              {transitionText}
            </p>
            <CaretDown size={16} weight="bold" style={{ color: `${color}66` }} aria-hidden />
          </div>
        </SlideIn>
      )}

      <div
        className={`mx-auto flex w-full max-w-[1200px] flex-col gap-8 md:items-center md:gap-14 ${
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
          <div className="flex flex-col gap-5 md:gap-6">
            <motion.div
              variants={headerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              className="flex flex-col gap-2.5 md:gap-3"
            >
              <motion.span
                variants={eyebrowVariants}
                className="font-nunito text-[13px] font-extrabold tracking-[1.5px] uppercase"
                style={{ color }}
              >
                {`SECTION ${index}`}
              </motion.span>
              <motion.h2
                variants={titleVariants}
                className="font-nunito text-[30px] leading-[40px] font-bold md:text-[40px] md:leading-[50px]"
                style={{ color }}
              >
                {label}
              </motion.h2>
              <motion.p
                variants={descVariants}
                className="font-nunito text-[14px] leading-[22px] text-grey-600 md:text-[16px] md:leading-[26px]"
              >
                {description}
              </motion.p>
            </motion.div>

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
