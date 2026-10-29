import type { ReelLink, VideoWork } from "@/lib/types";
import { MoreWorkCard } from "@/components/video-section/MoreWorkCard";
import { FadeIn } from "@/components/FadeIn";

/** The lower-hierarchy "更多作品" grid — identical on the homepage and /video. */
export function MoreWorksSection({
  more,
  reelLinksByWorkId,
}: {
  more: VideoWork[];
  reelLinksByWorkId: Record<string, ReelLink[]>;
}) {
  if (more.length === 0) return null;

  return (
    <section aria-label="更多作品" className="border-t border-line">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-24">
        <FadeIn>
          <h2 className="text-2xl md:text-3xl">更多作品</h2>
        </FadeIn>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {more.map((work, i) => (
            <FadeIn key={work.id} delay={0.1 + i * 0.1}>
              <MoreWorkCard work={work} reelLinks={reelLinksByWorkId[work.id] ?? []} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
