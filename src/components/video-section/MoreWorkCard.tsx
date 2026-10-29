import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { ReelLink, VideoWork } from "@/lib/types";
import { resolveFallbackThumbnailUrl, resolveThumbnailUrl } from "@/lib/video";
import { ThumbnailImage } from "@/components/video-section/ThumbnailImage";

/**
 * A lower-hierarchy "more works" column (教學性質短影片 / 生活記事 Vlog) --
 * an open-ended series rather than one deliverable, so it's always a
 * thumbnail + itemized link list that can grow over time, with an
 * optional "查看完整帳號" shortcut to the account/profile itself.
 */
export function MoreWorkCard({ work, reelLinks }: { work: VideoWork; reelLinks: ReelLink[] }) {
  const thumbnailUrl = resolveThumbnailUrl(work.thumbnail_url, work.video_url);
  const thumbnailFallbackUrl = resolveFallbackThumbnailUrl(work.thumbnail_url, work.video_url);

  const thumbnail = thumbnailUrl ? (
    <ThumbnailImage
      src={thumbnailUrl}
      fallbackSrc={thumbnailFallbackUrl}
      alt={`${work.title} 縮圖`}
      className="h-full w-full object-cover"
    />
  ) : (
    <div className="h-full w-full bg-ink-faint/20" aria-hidden />
  );

  return (
    <article className="bg-ink/[0.03] p-6 md:p-8">
      <div className="aspect-square w-full max-w-[200px] overflow-hidden">{thumbnail}</div>
      <div className="mt-5">
        <h3 className="text-base md:text-lg">{work.title}</h3>
        {work.subtitle && <p className="mt-1 text-xs text-ink-faint">{work.subtitle}</p>}

        {work.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
            {work.tags.map((tag) => (
              <span key={tag} className="text-[10px] tracking-[0.15em] text-ink-faint">
                {tag.toUpperCase()}
              </span>
            ))}
          </div>
        )}

        {work.description && (
          <p className="mt-3 max-w-[50ch] text-sm leading-relaxed text-ink-muted">
            {work.description}
          </p>
        )}

        {reelLinks.length > 0 && (
          <ul className="mt-5 space-y-2.5">
            {reelLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`在新分頁開啟 ${link.label}`}
                  className="group inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-accent"
                >
                  {link.label}
                  <ArrowUpRight
                    size={12}
                    weight="light"
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </a>
              </li>
            ))}
          </ul>
        )}

        {work.video_url && (
          <a
            href={work.video_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`在新分頁開啟 ${work.title} 的完整帳號`}
            className={`group inline-flex items-center gap-1.5 text-sm text-ink transition-colors hover:text-accent ${
              reelLinks.length > 0 ? "mt-4" : "mt-5"
            }`}
          >
            查看完整帳號
            <ArrowUpRight size={14} weight="light" className="transition-transform group-hover:translate-x-0.5" />
          </a>
        )}
      </div>
    </article>
  );
}
