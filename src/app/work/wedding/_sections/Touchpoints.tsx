import { ArrowUpRight, Warning } from "@phosphor-icons/react/dist/ssr";
import { SlideIn } from "@/components/design-system/SlideIn";
import { SectionKicker } from "@/components/design-system/SectionKicker";
import { MockupSlot } from "@/components/design-system/MockupSlot";
import { PhoneFrame } from "@/components/design-system/PhoneFrame";
import { Tag } from "@/components/design-system/Tag";
import { MouseTilt } from "@/components/design-system/MouseTilt";
import { FlipInvitationCard } from "./FlipInvitationCard";
import { ScaledIframeEmbed } from "./ScaledIframeEmbed";

interface Touchpoint {
  index: string;
  title: string;
  titleEn: string;
  time: string;
  desc: string;
  highlights: string[];
  tech?: string;
  demoUrl?: string;
  demoLabel?: string;
  // Admin-uploaded/pasted media -- `imageUrl`/`frontComposedImageUrl`/
  // `backImageUrl` are named so the generic admin ContentEditor (see
  // ContentEditor.tsx's MEDIA_KEY_PATTERN) auto-detects them as nested
  // media fields inside this array and renders an AdminMediaDropzone for
  // each, no admin UI code needed beyond adding these keys to the data.
  // `youtubeUrl` is deliberately NOT named `...videoUrl` -- it's a plain
  // pasted link (the opening film is hosted unlisted on YouTube, not
  // uploaded as a file -- see YouTubeEmbed's doc comment for why), so it
  // renders as an ordinary text field in admin rather than a file
  // dropzone, which better matches what it actually is.
  imageUrl?: string;
  youtubeUrl?: string;
  // `frontComposedImageUrl`/`smallBackComposedImageUrl`/
  // `backComposedImageUrl` are flat exports from Joe's own design tool --
  // big/small card + the real paperclip baked into one photo per state
  // (the clip stays in frame in all three, including the back one, since
  // it's a continuous physical object), not separate layers composited
  // live (see FlipInvitationCard's doc comment for why that changed).
  frontComposedImageUrl?: string;
  smallBackComposedImageUrl?: string;
  backComposedImageUrl?: string;
}

const CARD_SHADOW = "shadow-[0px_8px_12px_rgba(64,50,42,0.06),0px_1.5px_1.5px_rgba(64,50,42,0.04)]";

/**
 * 結婚書約 and 紙本喜帖 are both already-finished, self-contained designs
 * (collage/card artwork with their own drop-shadow and framing baked in,
 * per the originals Joe shared) — wrapping them in a second rounded+
 * shadow "frame" on top of that was the thing Joe flagged, and
 * `object-cover` inside the previous landscape 4:3 box was cropping the
 * top/bottom off their tall portrait shape. These render as bare,
 * unframed `object-contain` images in a portrait 3:4 box instead, so the
 * full design shows regardless of its real aspect ratio.
 */
function UnframedImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="aspect-[3/4] w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-full w-full object-contain" />
    </div>
  );
}

/**
 * Extracts the 11-character video ID from any of YouTube's own URL
 * shapes (youtu.be/ID, youtube.com/watch?v=ID, /embed/ID, /shorts/ID) --
 * an unlisted video's share link is the same `watch?v=` shape a public
 * one uses (unlisted is a visibility setting, not a different URL), so
 * no special-casing is needed for that; embedding just works as long as
 * the uploader hasn't disabled embedding for the video.
 */
function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1) || null;
    if (parsed.hostname.replace(/^www\./, "") === "youtube.com") {
      if (parsed.pathname === "/watch") return parsed.searchParams.get("v");
      const match = parsed.pathname.match(/^\/(?:embed|shorts)\/([^/?]+)/);
      if (match) return match[1];
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Opening film, embedded from YouTube rather than uploaded as a file --
 * switched from a direct `<video>` upload after Joe's upload turned out
 * to be a `.mov`/QuickTime container that loaded its own duration but
 * wouldn't actually play in most browsers, and Joe decided to host it on
 * YouTube (unlisted) instead rather than chase down a transcode. A
 * malformed/unparseable link gets the same dark placeholder treatment as
 * a genuinely broken video, so this never silently renders an empty box.
 */
function YouTubeEmbed({ url }: { url: string }) {
  const videoId = extractYouTubeId(url);

  if (!videoId) {
    return (
      <div className={`flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-[20px] bg-primary-black px-6 text-center text-proj-white ${CARD_SHADOW}`}>
        <Warning size={24} weight="light" className="text-accent-pink" />
        <p className="font-nunito text-[12px] leading-relaxed font-bold md:text-[13px]">
          無法辨識這個 YouTube 連結
        </p>
      </div>
    );
  }

  return (
    <div className={`aspect-video w-full overflow-hidden rounded-[20px] ${CARD_SHADOW}`}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="婚禮開場影片"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  );
}

/**
 * Real media takes over wherever it's been uploaded from the admin
 * dashboard; anything not yet uploaded falls back to a clearly labeled
 * MockupSlot/PhoneFrame placeholder (same precedent tct/page.tsx set for
 * a project with no media yet), so the page keeps reading as intentional
 * while assets trickle in and never needs a layout change once they do.
 * Index 03 (紙本喜帖) is the exception — it has its own interactive
 * FlipInvitationCard rather than a single static image/placeholder,
 * cycling between three separate flat photos (one per real-object state)
 * instead of one.
 */
function TouchpointVisual({ touchpoint }: { touchpoint: Touchpoint }) {
  if (touchpoint.index === "02") {
    // Live-embedded rather than a static screenshot -- visitors can
    // actually play through the paper-airplane unlock inside the phone
    // frame instead of just looking at a picture of it, so the separate
    // "查看電子喜帖" external link below is dropped for this touchpoint
    // (see the demoUrl guard in TouchpointCard).
    //
    // nativeHeight=680 (not ScaledIframeEmbed's 812 default) -- Joe's
    // actual Framer canvas renders shorter than a full 375x812 iPhone
    // viewport, so requesting the full 812 left blank page background
    // (plus the Framer watermark, which pins to the VIEWPORT bottom
    // rather than the design's own bottom edge) showing as unnatural
    // whitespace under the illustration. If this is still off once Joe
    // sees it live, it's this one number to retune.
    const screen = touchpoint.demoUrl ? (
      <ScaledIframeEmbed src={touchpoint.demoUrl} title={touchpoint.title} nativeHeight={680} />
    ) : touchpoint.imageUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={touchpoint.imageUrl} alt={touchpoint.title} className="h-full w-full object-cover" />
    ) : undefined;
    return (
      <div className="mx-auto w-full max-w-[220px]">
        <PhoneFrame screen={screen} label="電子喜帖畫面 素材製作中" />
      </div>
    );
  }

  if (touchpoint.index === "04") {
    if (touchpoint.youtubeUrl) return <YouTubeEmbed url={touchpoint.youtubeUrl} />;
    return <MockupSlot label="婚禮開場影片 素材製作中" aspect="aspect-video" />;
  }

  if (touchpoint.index === "03") {
    return (
      <FlipInvitationCard
        frontComposedImageUrl={touchpoint.frontComposedImageUrl}
        smallBackComposedImageUrl={touchpoint.smallBackComposedImageUrl}
        backComposedImageUrl={touchpoint.backComposedImageUrl}
      />
    );
  }

  // 結婚書約 (01) tilts toward the cursor on desktop -- Joe's own call,
  // specific to this touchpoint rather than every plain-image one, so it's
  // gated on the index rather than folded into the generic branch below.
  if (touchpoint.index === "01" && touchpoint.imageUrl) {
    return (
      <MouseTilt className="block">
        <UnframedImage src={touchpoint.imageUrl} alt={touchpoint.title} />
      </MouseTilt>
    );
  }

  if (touchpoint.imageUrl) {
    return <UnframedImage src={touchpoint.imageUrl} alt={touchpoint.title} />;
  }
  return <MockupSlot label={`${touchpoint.title} 素材製作中`} aspect="aspect-[3/4]" />;
}

function TouchpointCard({ touchpoint, index }: { touchpoint: Touchpoint; index: number }) {
  const reverse = index % 2 === 1;
  const paragraphs = touchpoint.desc.split("\n\n");

  return (
    <div
      className={`flex flex-col gap-8 md:flex-row md:items-center md:gap-14 ${
        reverse ? "md:flex-row-reverse" : ""
      }`}
    >
      <SlideIn direction={reverse ? "right" : "left"} className="w-full md:w-[320px] md:shrink-0">
        <TouchpointVisual touchpoint={touchpoint} />
      </SlideIn>

      <div className="flex flex-1 flex-col gap-4">
        <SlideIn direction={reverse ? "left" : "right"} delay={0.1}>
          <div className="flex items-baseline gap-3">
            <span className="font-fredoka text-[32px] leading-none text-accent-pink md:text-[40px]">
              {touchpoint.index}
            </span>
            <div>
              <h3 className="font-nunito text-[20px] font-bold text-primary-black md:text-[26px]">
                {touchpoint.title}
              </h3>
              <p className="font-nunito text-[11px] font-bold tracking-[0.1em] text-grey-500 uppercase md:text-[12px]">
                {touchpoint.titleEn} · {touchpoint.time}
              </p>
            </div>
          </div>
        </SlideIn>

        {paragraphs.length > 0 && (
          <SlideIn delay={0.2} className="flex flex-col gap-4">
            {paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 12)}
                className="font-nunito text-[14px] leading-[22px] text-grey-700 md:text-[16px] md:leading-[26px]"
              >
                {paragraph}
              </p>
            ))}
          </SlideIn>
        )}

        {touchpoint.highlights.length > 0 && (
          <SlideIn delay={0.3}>
            <ul className="flex flex-col gap-2">
              {touchpoint.highlights.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 font-nunito text-[13px] leading-[20px] text-grey-600 md:text-[14px]"
                >
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent-pink" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </SlideIn>
        )}

        {(touchpoint.tech || (touchpoint.demoUrl && touchpoint.index !== "02")) && (
          <SlideIn delay={0.4} className="flex flex-col items-start gap-3">
            {touchpoint.tech && (
              <Tag variant="pink" className="w-fit">
                {touchpoint.tech}
              </Tag>
            )}

            {/* index 02 embeds demoUrl live in its phone frame (see
                TouchpointVisual) instead of linking out to it */}
            {touchpoint.demoUrl && touchpoint.index !== "02" && (
              <a
                href={touchpoint.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex w-fit items-center gap-2 border-b border-primary-black pb-1 font-nunito text-[14px] font-bold text-primary-black transition-colors hover:border-accent-pink hover:text-accent-pink"
              >
                {touchpoint.demoLabel ?? "查看連結"}
                <ArrowUpRight size={16} weight="bold" />
              </a>
            )}
          </SlideIn>
        )}
      </div>
    </div>
  );
}

/**
 * Sections 3–6 — the four touchpoints (結婚書約 / 電子喜帖 / 紙本喜帖 /
 * 婚禮開場影片), merged into one scrolling section rather than four
 * separate full-screen ones (continuous pacing, see Background.tsx).
 * Alternating left/right layout per card is this section's own
 * signature motif — each touchpoint faces the opposite direction of the
 * last, reading as a back-and-forth conversation across the four media.
 *
 * Content model: `process.touchpoints` — array of
 * `{index, title, titleEn, time, desc, highlights, tech?, demoUrl?,
 * demoLabel?, imageUrl?, youtubeUrl?, frontComposedImageUrl?,
 * smallBackComposedImageUrl?, backComposedImageUrl?}`. The media fields are
 * optional and admin-editable (see TouchpointVisual).
 */
export function Touchpoints({ process }: { process: Record<string, unknown> }) {
  const touchpoints = Array.isArray(process.touchpoints) ? (process.touchpoints as Touchpoint[]) : [];
  if (touchpoints.length === 0) return null;

  return (
    <section className="bg-proj-white px-6 py-16 md:px-[120px] md:py-24">
      <div className="mx-auto flex max-w-[1040px] flex-col gap-16 md:gap-24">
        <SlideIn className="flex flex-col items-center gap-3 text-center">
          <SectionKicker color="pink">TOUCHPOINTS</SectionKicker>
          <h2 className="font-nunito text-[22px] font-bold text-primary-black md:text-[36px]">
            四個接觸點，一套語言
          </h2>
        </SlideIn>

        <div className="flex flex-col gap-16 md:gap-20">
          {touchpoints.map((touchpoint, i) => (
            <TouchpointCard key={touchpoint.index} touchpoint={touchpoint} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
