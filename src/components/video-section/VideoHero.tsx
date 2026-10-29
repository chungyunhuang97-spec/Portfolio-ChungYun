import { FadeIn } from "@/components/FadeIn";

/**
 * Full-bleed cinematic opener for the dedicated /video page — the real
 * thumbnail of the first featured work stands in as the hero image (this
 * is actual footage of hers, not a stock photo), with a scrim for text
 * legibility and one CTA down into the work itself.
 */
export function VideoHero({
  imageUrl,
  imageAlt,
  headline,
  subhead,
}: {
  imageUrl: string | null;
  imageAlt: string;
  headline: string;
  subhead: string;
}) {
  return (
    <section className="relative flex min-h-[92svh] items-end overflow-hidden bg-ink">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- real YouTube thumbnail, not a next/image-allowlisted host
        <img
          src={imageUrl}
          alt={imageAlt}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(17,17,16,0.15) 0%, rgba(17,17,16,0.35) 55%, rgba(17,17,16,0.88) 100%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 pb-16 md:px-10 md:pb-24">
        <FadeIn>
          <h1 className="max-w-[18ch] text-4xl leading-[1.05] tracking-tight text-bg md:text-6xl">
            {headline}
          </h1>
          <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-bg/80 md:text-lg">
            {subhead}
          </p>
          <a
            href="#featured"
            className="group mt-9 inline-flex items-center gap-2 border-b border-bg/70 pb-1 text-sm tracking-wide text-bg transition-colors hover:border-bg"
          >
            觀看作品
            <span aria-hidden className="transition-transform group-hover:translate-y-0.5">
              ↓
            </span>
          </a>
        </FadeIn>
      </div>
    </section>
  );
}
