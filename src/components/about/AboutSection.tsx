import { ArrowUpRight, DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import {
  DoodleEye,
  DoodlePlus,
  DoodleScribble,
  DoodleSpiral,
  DoodleSplat,
  DoodleStar,
} from "@/components/design-system/doodles";
import { displayNumber } from "@/lib/about-video";
import type { AboutData } from "@/lib/data";
import type { AboutIcon } from "@/lib/types";

function TraitIcon({ icon }: { icon: AboutIcon }) {
  const cls = "h-6 w-6";
  if (icon === "star") return <DoodleStar className={cls} />;
  if (icon === "plus") return <DoodlePlus className={cls} />;
  if (icon === "spiral") return <DoodleSpiral className={cls} strokeWidth={8} />;
  if (icon === "zigzag") return <DoodleScribble className={cls} strokeWidth={8} />;
  if (icon === "eye") return <DoodleEye className={cls} strokeWidth={8} />;
  return null;
}

/** Splits the statement into plain / highlighted runs (case-insensitive). */
function highlightRuns(statement: string, words: string[]) {
  const targets = words.map((w) => w.trim()).filter(Boolean);
  if (targets.length === 0) return [{ text: statement, hit: false }];
  const escaped = targets
    .sort((a, b) => b.length - a.length)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return statement
    .split(new RegExp(`(${escaped.join("|")})`, "gi"))
    .filter(Boolean)
    .map((text) => ({ text, hit: targets.some((t) => t.toUpperCase() === text.toUpperCase()) }));
}

/**
 * A highlighted phrase with a hand-drawn marker stroke behind its lower
 * half. The stroke only covers the bottom of the glyphs, so the cream
 * text still sits on blue (cream-on-orange alone is just 2.8:1). The
 * path is the target of the Phase 4 stroke-draw; here it's the final state.
 */
function Highlight({ children }: { children: string }) {
  return (
    <span className="relative isolate inline-block whitespace-nowrap">
      <svg
        aria-hidden
        viewBox="0 0 100 20"
        preserveAspectRatio="none"
        className="absolute -inset-x-[0.06em] bottom-[0.02em] -z-10 h-[0.42em] w-[calc(100%+0.12em)] overflow-visible text-primary-orange"
      >
        <path
          data-highlight-stroke
          d="M2 12 C 22 7, 45 15, 62 10 S 88 8, 98 11"
          fill="none"
          stroke="currentColor"
          strokeWidth={16}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          pathLength={1}
          style={{ strokeWidth: "0.36em" }}
        />
      </svg>
      {children}
    </span>
  );
}

/**
 * Homepage "02 / ABOUT" -- blue section, cream type. Statement + intro on
 * the left (7 cols), tilted portrait on the right (5 cols), then the three
 * traits, the optional stats row, the optional tools marquee and the CTAs.
 * Mobile reorders to statement -> portrait -> intro via grid areas.
 */
export function AboutSection({ data, marqueeEnabled }: { data: AboutData; marqueeEnabled: boolean }) {
  const { content, traits, stats, tools } = data;
  const runs = highlightRuns(content.statement, content.highlight_words);
  const showMarquee = content.show_tools_marquee && tools.length > 0;

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative overflow-hidden bg-secondary-blue py-20 text-cream md:py-28"
      style={{
        paddingLeft: "max(16px, env(safe-area-inset-left))",
        paddingRight: "max(16px, env(safe-area-inset-right))",
      }}
    >
      {/* Corner doodles: decoration only, kept clear of the content column. */}
      <DoodleSpiral
        aria-hidden
        strokeWidth={3}
        className="pointer-events-none absolute -right-12 top-[58%] hidden w-40 text-cream/25 lg:block"
      />
      <DoodleScribble
        aria-hidden
        strokeWidth={4}
        className="pointer-events-none absolute bottom-10 left-6 hidden w-28 text-primary-orange md:block"
      />

      <div className="relative mx-auto w-full max-w-[1400px] md:px-6 wide:max-w-[1600px]">
        <p className="font-nunito text-[11px] font-extrabold tracking-[0.25em] text-cream md:text-[13px]">
          02 / ABOUT
        </p>

        <div className="about-top mt-6 grid gap-x-12 gap-y-10">
          <h2
            id="about-heading"
            className="[grid-area:statement] min-w-0 text-[clamp(36px,5.4vw,80px)] uppercase leading-[1.02] [overflow-wrap:anywhere]"
          >
            <span className="font-fredoka">
              {runs.map((r, i) =>
                r.hit ? (
                  // One stroke per word, so a phrase that wraps keeps its marker on every line.
                  r.text.split(/(\s+)/).map((part, j) =>
                    part.trim() ? <Highlight key={`${i}-${j}`}>{part}</Highlight> : part
                  )
                ) : (
                  <span key={i}>{r.text}</span>
                )
              )}
            </span>
          </h2>

          <div className="[grid-area:photo] flex justify-center lg:items-start lg:justify-end">
            {content.portrait_image ? (
              <figure className="about-portrait group relative w-4/5 max-w-[380px] md:w-3/5 lg:w-full lg:max-w-[400px]">
                {/* eslint-disable-next-line @next/next/no-img-element -- Supabase Storage URL */}
                <img
                  src={content.portrait_image}
                  alt={content.portrait_alt ?? ""}
                  loading="lazy"
                  className="aspect-[4/5] w-full rounded-[var(--radius-card-lg)] object-cover shadow-[0_24px_48px_-20px_rgba(0,0,0,0.45)]"
                />
                <DoodleStar aria-hidden className="about-sticker absolute -right-5 -top-5 h-16 w-16 text-primary-orange md:h-20 md:w-20" />
              </figure>
            ) : (
              <DoodleSplat aria-hidden className="w-[min(70%,320px)] text-cream/90 lg:w-[80%]" />
            )}
          </div>

          <p className="[grid-area:intro] max-w-[60ch] whitespace-pre-line font-nunito text-base leading-relaxed text-cream/90 md:text-lg">
            {content.intro}
          </p>
        </div>

        {traits.length > 0 && (
          <ul className="mt-14 grid grid-cols-1 gap-4 md:mt-20 md:grid-cols-3 md:gap-5">
            {traits.map((t, i) => (
              <li
                key={t.id}
                className="about-trait group flex flex-col rounded-[var(--radius-card)] bg-cream p-6 text-grey-900 lg:rounded-[var(--radius-card-lg)] lg:p-7"
              >
                <div className="flex items-start justify-between text-secondary-blue">
                  <span className="about-trait-number rounded-full font-fredoka text-[44px] leading-none">
                    {displayNumber(i)}
                  </span>
                  <TraitIcon icon={t.icon} />
                </div>
                <h3 className="mt-5 text-[22px] leading-tight">
                  <span className="font-fredoka">{t.title}</span>
                </h3>
                <p className="mt-2 font-nunito text-[15px] leading-relaxed text-grey-700">{t.description}</p>
              </li>
            ))}
          </ul>
        )}

        {stats.length > 0 && (
          <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-y border-cream/25 py-8 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.id} className="flex flex-col-reverse gap-1">
                <dt className="font-nunito text-sm text-cream/85">{s.label}</dt>
                <dd className="font-fredoka text-[44px] leading-none md:text-[56px]">
                  <span data-stat-value={s.value}>{s.value}</span>
                  {s.suffix}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {showMarquee && (
          <div
            className="about-marquee mt-12 -mx-4 overflow-hidden border-y border-cream/25 py-4 md:-mx-6"
            data-paused={marqueeEnabled ? undefined : "true"}
          >
            <p className="sr-only">工具：{tools.map((t) => t.name).join("、")}</p>
            <div aria-hidden className="about-marquee-track flex w-max">
              {[0, 1].map((copy) => (
                <ul key={copy} className="flex shrink-0 items-center">
                  {tools.map((t) => (
                    <li key={t.id} className="flex items-center font-nunito text-sm font-extrabold uppercase tracking-[0.2em] md:text-base">
                      <span className="px-5">{t.name}</span>
                      <DoodleStar className="h-3.5 w-3.5 text-primary-orange" />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        )}

        {(content.resume_file || content.contact_link) && (
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {content.resume_file && (
              <a
                href={content.resume_file}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-cream px-6 font-nunito text-[15px] font-bold text-secondary-blue transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-cream"
              >
                <DownloadSimple size={18} weight="bold" aria-hidden />
                下載履歷
              </a>
            )}
            {content.contact_link && (
              <a
                href={content.contact_link}
                className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-cream px-6 font-nunito text-[15px] font-bold text-cream transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-cream"
              >
                聯絡我
                <ArrowUpRight size={18} weight="bold" aria-hidden />
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
