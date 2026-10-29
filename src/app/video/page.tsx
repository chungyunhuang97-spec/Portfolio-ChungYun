import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVideoSectionData } from "@/lib/data";
import { resolveFallbackThumbnailUrl, resolveThumbnailUrl } from "@/lib/video";
import { Navbar } from "@/components/design-system/Navbar";
import { VideoHero } from "@/components/video-section/VideoHero";
import { FeaturedWorkRow } from "@/components/video-section/FeaturedWorkRow";
import { MoreWorksSection } from "@/components/video-section/MoreWorksSection";
import { FadeIn } from "@/components/FadeIn";

export const revalidate = 60;

const HEADLINE = "企劃、執導、剪輯——我用影像說故事";
const SUBHEAD =
  "從一場婚禮的開場到孩子的滿週歲，我負責企劃、現場執導與後製剪輯，把真正重要的瞬間剪進片子裡。";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "影片製作 — Chung Yun Huang",
    description: SUBHEAD,
  };
}

export default async function VideoPage() {
  const data = await getVideoSectionData();

  if (!data || (data.featured.length === 0 && data.more.length === 0)) {
    notFound();
  }

  const { featured, more, reelLinksByWorkId } = data;
  const heroWork = featured[0] ?? more[0];
  const heroImage = heroWork
    ? resolveThumbnailUrl(heroWork.thumbnail_url, heroWork.video_url)
    : null;
  const heroImageFallback = heroWork
    ? resolveFallbackThumbnailUrl(heroWork.thumbnail_url, heroWork.video_url)
    : null;

  return (
    <>
      <Navbar wordmarkTone="light" backHref="/" />
      <main className="flex-1">
        <VideoHero
          imageUrl={heroImage}
          imageFallbackUrl={heroImageFallback}
          imageAlt={heroWork?.title ?? "影片製作"}
          headline={HEADLINE}
          subhead={SUBHEAD}
        />

        {featured.length > 0 && (
          <section id="featured" aria-label="精選作品" className="border-t border-line">
            <div className="mx-auto max-w-[1400px] px-6 pt-16 md:px-10 md:pt-20">
              <FadeIn>
                <h2 className="text-2xl md:text-3xl">精選作品</h2>
              </FadeIn>
            </div>
            {featured.map((work, i) => (
              <FeaturedWorkRow
                key={work.id}
                work={work}
                reverse={i % 2 === 1}
                toneStep={i % 2 === 1}
                size={i % 2 === 0 ? "large" : "default"}
                emphasize={i === 0}
              />
            ))}
          </section>
        )}

        <MoreWorksSection more={more} reelLinksByWorkId={reelLinksByWorkId} />

        <footer className="border-t border-line">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-6 py-10 text-sm text-ink-faint md:flex-row md:items-center md:justify-between md:px-10">
            <p>© {new Date().getFullYear()} Chung Yun Huang</p>
            <a
              href="mailto:chungyunhuang97@gmail.com"
              className="transition-colors hover:text-ink"
            >
              chungyunhuang97@gmail.com
            </a>
          </div>
        </footer>
      </main>
    </>
  );
}
