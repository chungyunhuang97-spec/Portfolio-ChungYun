import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { ReelLink, VideoWork } from "@/lib/types";
import { resolveThumbnailUrl } from "@/lib/video";

/**
 * Card C/D — a lower-hierarchy "more works" entry. Renders as a list of
 * external Reel links when reel_links rows exist for this work (卡片 C,
 * 教學 Reels); otherwise the whole card is a single link out (卡片 D, the
 * personal IG profile).
 */
export function MoreWorkCard({ work, reelLinks }: { work: VideoWork; reelLinks: ReelLink[] }) {
  const thumbnailUrl = resolveThumbnailUrl(work.thumbnail_url, work.video_url);

  const thumbnail = thumbnailUrl ? (
    <img src={thumbnailUrl} alt={`${work.title} 縮圖`} className="h-full w-full object-cover" />
  ) : (
    <div className="h-full w-full bg-ink-faint/20" aria-hidden />
  );

  const body = (
    <>
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
    </>
  );

  if (reelLinks.length > 0) {
    return (
      <article className="border border-line p-5 md:p-6">
        <div className="aspect-square w-full max-w-[180px] overflow-hidden">{thumbnail}</div>
        <div className="mt-4">
          {body}
          <ul className="mt-4 space-y-2 divide-y divide-line">
            {reelLinks.map((link) => (
              <li key={link.id} className="pt-2 first:pt-0">
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
        </div>
      </article>
    );
  }

  if (!work.video_url) {
    return (
      <article className="border border-line p-5 md:p-6">
        <div className="aspect-square w-full max-w-[140px] overflow-hidden rounded-full">
          {thumbnail}
        </div>
        <div className="mt-4">{body}</div>
      </article>
    );
  }

  return (
    <a
      href={work.video_url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`在新分頁開啟 ${work.title} 的 Instagram`}
      className="group block border border-line p-5 transition-colors hover:border-ink md:p-6"
    >
      <div className="aspect-square w-full max-w-[140px] overflow-hidden rounded-full">
        {thumbnail}
      </div>
      <div className="mt-4">
        {body}
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-ink transition-colors group-hover:text-accent">
          前往 Instagram
          <ArrowUpRight size={14} weight="light" className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </a>
  );
}
