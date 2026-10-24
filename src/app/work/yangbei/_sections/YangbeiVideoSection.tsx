"use client";

import { SlideIn } from "@/components/design-system/SlideIn";
import { Check, FilmSlate } from "@phosphor-icons/react/dist/ssr";

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
}

/**
 * One reusable "視角" walkthrough: a short intro, a 16:9 video (or upload
 * placeholder), and a row of design-highlight callouts. Reused three times
 * from page.tsx for 前台/中台/後台, each passed its own copy, video URL and
 * highlights so this component itself carries no platform-specific content.
 */
export function YangbeiVideoSection({ index, label, description, videoUrl, highlights, color }: Props) {
  return (
    <section className="bg-proj-white px-6 py-16 md:px-[120px] md:py-[80px]">
      <SlideIn delay={0.05}>
        <div className="mx-auto mb-8 flex max-w-[720px] flex-col items-center gap-3 text-center md:mb-12">
          <span className="font-nunito text-[13px] font-extrabold tracking-[1px] uppercase" style={{ color }}>
            {index} — {label}
          </span>
          <p className="font-nunito text-[14px] leading-[22px] text-grey-600 md:text-[16px] md:leading-[26px]">
            {description}
          </p>
        </div>
      </SlideIn>

      <SlideIn delay={0.1}>
        <div className="mx-auto max-w-[920px]">
          <VideoFrame videoUrl={videoUrl} label={label} color={color} />

          {highlights.length > 0 && (
            <div className="mt-6 flex flex-col gap-2.5 md:flex-row md:flex-wrap md:justify-center md:gap-3">
              {highlights.map((feat) => (
                <div
                  key={feat}
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
                </div>
              ))}
            </div>
          )}
        </div>
      </SlideIn>
    </section>
  );
}
