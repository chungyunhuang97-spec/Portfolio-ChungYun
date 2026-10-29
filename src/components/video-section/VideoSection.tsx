import type { VideoSectionData } from "@/lib/data";
import { FadeIn } from "@/components/FadeIn";
import { FeaturedVideoCard } from "@/components/video-section/FeaturedVideoCard";
import { MoreWorkCard } from "@/components/video-section/MoreWorkCard";

/** Homepage "影片製作" section. Hidden entirely unless the caller already
 * confirmed `video_section_settings.is_visible` (see getVideoSectionData). */
export function VideoSection({ data }: { data: VideoSectionData }) {
  const { featured, more, reelLinksByWorkId } = data;

  if (featured.length === 0 && more.length === 0) return null;

  return (
    <section id="video" aria-label="影片製作作品" className="border-t border-line">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-24">
        <FadeIn>
          <h2 className="text-2xl md:text-3xl">影片製作</h2>
          <p className="mt-2 text-sm tracking-[0.1em] text-ink-faint">企劃 · 導演 · 剪輯</p>
        </FadeIn>

        {featured.length > 0 && (
          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
            {featured.map((work, i) => (
              <FadeIn key={work.id} delay={0.1 + i * 0.1}>
                <FeaturedVideoCard work={work} />
              </FadeIn>
            ))}
          </div>
        )}

        {more.length > 0 && (
          <div className="mt-16">
            <FadeIn>
              <p className="text-xs tracking-[0.2em] text-ink-faint">更多作品</p>
            </FadeIn>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
              {more.map((work, i) => (
                <FadeIn key={work.id} delay={0.1 + i * 0.1}>
                  <MoreWorkCard work={work} reelLinks={reelLinksByWorkId[work.id] ?? []} />
                </FadeIn>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
