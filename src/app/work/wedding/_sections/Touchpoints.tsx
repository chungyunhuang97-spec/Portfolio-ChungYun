import { ArrowRight, ArrowUpRight, Warning } from "@phosphor-icons/react/dist/ssr";
import { SlideIn } from "@/components/design-system/SlideIn";
import { SectionKicker } from "@/components/design-system/SectionKicker";
import { MockupSlot } from "@/components/design-system/MockupSlot";
import { PhoneFrame } from "@/components/design-system/PhoneFrame";
import { MouseTilt } from "@/components/design-system/MouseTilt";
import { FlipInvitationCard } from "./FlipInvitationCard";
import { NotificationPing, PaperLandingWrap, TVPowerOn } from "./TouchpointEffects";

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
      <img src={src} alt={alt} className="h-full w-full rounded-[12px] object-contain" />
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
    // Static screenshot, not the live-embedded iframe this briefly was --
    // the scaled-down live Framer canvas was reading as broken layout
    // (cramped/overlapping at the ~220px phone-frame width), per Joe. A
    // plain screenshot inside the phone frame reads cleanly at any size.
    //
    // Per Figma, the "你收到一封電子喜帖" notification and the "查看電子喜帖"
    // button both sit OVERLAID directly on the phone's own screenshot, near
    // its bottom edge, instead of living below the phone as a separate
    // banner/link (this section's previous treatment) -- reads as the
    // phone itself surfacing a system notification rather than unrelated
    // page furniture under it.
    const screen = touchpoint.imageUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={touchpoint.imageUrl} alt={touchpoint.title} className="h-full w-full object-cover" />
    ) : undefined;
    return (
      <div className="relative mx-auto w-full max-w-[220px]">
        <PhoneFrame screen={screen} label="電子喜帖畫面 素材製作中" />
        <NotificationPing className="bottom-[21%]" />
        {touchpoint.demoUrl && (
          <SlideIn
            delay={0.9}
            viewportMargin="-60px"
            className="absolute inset-x-0 bottom-[6%] z-10 flex justify-center"
          >
            <a
              href={touchpoint.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1.5 rounded-xl bg-accent-pink px-3 py-2.5 font-nunito text-[11px] font-bold whitespace-nowrap text-proj-white shadow-[0px_2px_6px_rgba(255,91,192,0.4)] transition-transform hover:scale-105"
            >
              {touchpoint.demoLabel ?? "查看電子喜帖"}
              <ArrowRight size={14} weight="bold" />
            </a>
          </SlideIn>
        )}
      </div>
    );
  }

  if (touchpoint.index === "04") {
    if (touchpoint.youtubeUrl) {
      return (
        <TVPowerOn>
          <YouTubeEmbed url={touchpoint.youtubeUrl} />
        </TVPowerOn>
      );
    }
    return (
      <TVPowerOn>
        <MockupSlot label="婚禮開場影片 素材製作中" aspect="aspect-video" />
      </TVPowerOn>
    );
  }

  if (touchpoint.index === "03") {
    return (
      <PaperLandingWrap>
        <FlipInvitationCard
          frontComposedImageUrl={touchpoint.frontComposedImageUrl}
          smallBackComposedImageUrl={touchpoint.smallBackComposedImageUrl}
          backComposedImageUrl={touchpoint.backComposedImageUrl}
        />
      </PaperLandingWrap>
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

/**
 * Per Figma, mobile and desktop don't just reflow the same stack -- they
 * read in genuinely different ORDERS: mobile goes header -> highlight tags
 * (horizontally scrollable) -> mockup -> description, while desktop groups
 * header/description/tags/demo into one text column beside a separate
 * mockup column (alternating sides per `reverse`). A flex layout can't
 * express both without either duplicating the mockup (bad -- 02's phone
 * overlay, 03's flip-card click state, and 04's YouTube iframe would each
 * mount twice) or nesting the text pieces in a way that fights mobile's
 * different order. CSS Grid with named `grid-template-areas` solves both
 * at once: every piece is a single grid item, placed by breakpoint-
 * specific area names, so nothing in the DOM is duplicated.
 */
function TouchpointCard({ touchpoint, index }: { touchpoint: Touchpoint; index: number }) {
  const reverse = index % 2 === 1;
  const paragraphs = touchpoint.desc.split("\n\n");
  // Meta row combines translated label / date range / (optional) tech as
  // one dot-separated inline row per Figma, instead of a separate pink
  // Tag pill underneath -- 02 (電子喜帖) is the only touchpoint with a
  // `tech` value today, but this applies generically wherever it's set.
  const metaParts = [touchpoint.titleEn, touchpoint.time, touchpoint.tech].filter(Boolean);
  // Full, static class strings per branch (not built by interpolating a
  // sub-value into a shared template) -- Tailwind's build-time scanner
  // matches literal class-name substrings in the source file, so a class
  // name assembled from a runtime JS variable wouldn't be found/generated.
  const desktopGridClass = reverse
    ? "md:grid-cols-[1fr_320px] md:[grid-template-areas:'header_mockup'_'description_mockup'_'tags_mockup'_'demo_mockup']"
    : "md:grid-cols-[320px_1fr] md:[grid-template-areas:'mockup_header'_'mockup_description'_'mockup_tags'_'mockup_demo']";

  return (
    <div
      className={`grid grid-cols-1 gap-4 [grid-template-areas:'header'_'tags'_'mockup'_'description'_'demo'] md:items-center md:gap-x-14 md:gap-y-4 ${desktopGridClass}`}
    >
      <SlideIn direction={reverse ? "right" : "left"} className="[grid-area:mockup]">
        <TouchpointVisual touchpoint={touchpoint} />
      </SlideIn>

      <SlideIn direction={reverse ? "left" : "right"} delay={0.1} className="[grid-area:header]">
        <div className="flex items-center gap-3 md:gap-4">
          <span className="font-fredoka text-[56px] leading-none text-accent-pink md:text-[72px]">
            {touchpoint.index}
          </span>
          <div className="flex flex-col gap-1">
            <h3 className="font-nunito text-[20px] font-bold text-primary-black md:text-[28px]">
              {touchpoint.title}
            </h3>
            <p className="font-nunito flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] font-bold text-grey-500">
              {metaParts.map((part, i) => (
                <span key={part} className="flex items-center gap-2">
                  {i > 0 && <span className="size-[3px] rounded-full bg-grey-300" aria-hidden />}
                  {part}
                </span>
              ))}
            </p>
          </div>
        </div>
      </SlideIn>

      {paragraphs.length > 0 && (
        <SlideIn
          delay={0.2}
          className="[grid-area:description] flex flex-col gap-3 rounded-[10px] border-l-[3px] border-accent-pink bg-accent-pink/5 p-4"
        >
          {paragraphs.map((paragraph) => (
            <p
              key={paragraph.slice(0, 12)}
              className="font-nunito text-[14px] leading-[22px] text-grey-700 md:text-[16px] md:leading-[24px]"
            >
              {paragraph}
            </p>
          ))}
        </SlideIn>
      )}

      {touchpoint.highlights.length > 0 && (
        // Mobile: a single horizontally-scrollable row (Joe's ask -- "tag
        // 那一列是可以向右滑去查看全部的"), full-bleed past the card's own
        // padding via negative margin so the scroll area isn't visually
        // clipped at the card edge. Desktop: wraps onto multiple lines
        // instead, matching Figma's desktop Key Points layout.
        <SlideIn
          delay={0.3}
          className="[grid-area:tags] -mx-6 flex gap-2 overflow-x-auto px-6 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden"
        >
          {touchpoint.highlights.map((item) => (
            <span
              key={item}
              className="font-nunito shrink-0 rounded-full border border-accent-pink bg-[#fff0f9] px-3 py-1 text-[13px] whitespace-nowrap text-accent-pink md:text-[14px]"
            >
              {item}
            </span>
          ))}
        </SlideIn>
      )}

      {/* 02's demoUrl already renders as the pink "查看電子喜帖" button
          overlaid on the phone screenshot (see TouchpointVisual) -- showing
          it again here would duplicate the same link in the text column. */}
      {touchpoint.index !== "02" && touchpoint.demoUrl && (
        <SlideIn delay={0.4} className="[grid-area:demo]">
          <a
            href={touchpoint.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex w-fit items-center gap-2 border-b border-primary-black pb-1 font-nunito text-[14px] font-bold text-primary-black transition-colors hover:border-accent-pink hover:text-accent-pink"
          >
            {touchpoint.demoLabel ?? "查看連結"}
            <ArrowUpRight size={16} weight="bold" />
          </a>
        </SlideIn>
      )}
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
            從結婚書約到婚禮開場影片，歷時 16 個月
          </h2>
          <p className="font-nunito text-[16px] font-bold text-accent-pink md:text-[28px]">
            跨越 4 種媒介，沒有 brief，只有對人的理解。
          </p>
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
