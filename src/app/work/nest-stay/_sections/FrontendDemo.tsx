import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { SlideIn } from "@/components/design-system/SlideIn";
import type { Project } from "@/lib/types";

interface DemoPhase {
  phase: string;
  title: string;
  desc: string;
}

interface FrontendDemoContent {
  teamComposition: string;
  devTimeline: string;
  output: string;
  phases: DemoPhase[];
  buttonLabel: string;
}

/** Vertical hairline divider between the 3 meta stats, per Figma. */
function MetaDivider() {
  return <div className="hidden h-[38px] w-px shrink-0 bg-grey-100 md:block" aria-hidden />;
}

function MetaStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="font-nunito text-[12px] font-normal text-[#9e9e9e]">{label}</p>
      <p className="font-nunito text-[14px] font-bold text-primary-black">{value}</p>
    </div>
  );
}

/**
 * Simplified app-wireframe mockup card, per Figma's own placeholder graphic
 * in this section (a generic skeleton, not the site's iPhone-chrome
 * PhoneFrame) — a top drag-handle bar, one large image block, two half-width
 * blocks, and an orange-tinted block underneath.
 */
function AppWireframeCard() {
  return (
    <div className="relative flex h-[280px] w-[147px] flex-col items-center rounded-[21px] border border-grey-100 bg-proj-white shadow-[0_5px_8px_rgba(0,0,0,0.08)]">
      <div className="mt-[7px] h-[4px] w-10 shrink-0 rounded-full bg-[#e6e6e6]" aria-hidden />
      <div className="flex w-full flex-1 flex-col gap-1.5 p-2.5">
        <div className="h-20 w-full shrink-0 rounded-[5px] bg-grey-50" />
        <div className="flex w-full shrink-0 items-start gap-1.5">
          <div className="h-8 flex-1 rounded-[5px] bg-grey-50" />
          <div className="h-8 flex-1 rounded-[5px] bg-grey-50" />
        </div>
        <div className="h-[54px] w-full shrink-0 rounded-[5px] bg-primary-orange/10" />
      </div>
    </div>
  );
}

/**
 * 前端開發協作 & Demo 實作 (Frontend Demo), Figma desktop node 292:128 /
 * mobile 404:316. Rebuilt against the real page-level Figma frame — grey-50
 * band with a top/bottom hairline border, a 3-stat meta row with vertical
 * dividers, an orange-bordered mockup panel with the CTA centered on top of
 * a wireframe card graphic (not stacked below it), and 3 phase cards.
 *
 * Content model: reuses `process.frontendDemo` (`teamComposition`,
 * `devTimeline`, `output`, `phases` [3× {phase, title, desc}], `buttonLabel`).
 * The CTA links to `project.external_url`.
 */
export function FrontendDemo({ project, process }: { project: Project; process: Record<string, unknown> }) {
  const demo = process.frontendDemo as FrontendDemoContent | undefined;
  if (!demo) return null;

  return (
    <section className="border-y border-[#ededed] bg-grey-50 px-6 py-12 md:px-[120px] md:py-[72px]">
      <div className="flex flex-col gap-6 md:gap-8">
        <SlideIn delay={0.1}>
          <div className="flex flex-col gap-3">
            <span className="font-nunito text-[13px] font-extrabold tracking-[0.78px] text-primary-orange uppercase">
              Frontend &amp; Demo
            </span>
            <h3 className="font-nunito text-[26px] leading-[34px] font-bold text-primary-black md:text-[48px] md:leading-[72px]">
              前端開發協作 <span className="text-[#999]">&amp;</span> Demo 實作
            </h3>
            <div className="hidden w-full border-t border-dashed border-[#e0e0e0] md:block" />
          </div>
        </SlideIn>

        <SlideIn delay={0.15}>
          <div className="flex flex-col gap-4 rounded-xl bg-[#f9f9f9] px-5 py-4 md:flex-row md:items-center md:justify-between md:px-8 md:py-[18px]">
            <MetaStat label="團隊組成" value={demo.teamComposition} />
            <MetaDivider />
            <MetaStat label="開發時程" value={demo.devTimeline} />
            <MetaDivider />
            <MetaStat label="產出" value={demo.output} />
          </div>
        </SlideIn>

        <SlideIn delay={0.2}>
          <div className="relative flex min-h-[280px] w-full items-center justify-center rounded-3xl border border-primary-orange bg-white/50 p-10 md:min-h-[380px]">
            <AppWireframeCard />
            {project.external_url && (
              <a
                href={project.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-1/2 left-1/2 inline-flex w-fit -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-xl bg-primary-orange px-4 py-3.5 shadow-[0_2px_4px_rgba(255,82,13,0.2)] outline-none transition-transform hover:-translate-y-[calc(50%+2px)] focus-visible:ring-2 focus-visible:ring-primary-orange focus-visible:ring-offset-2"
              >
                <span className="font-nunito text-[14px] font-bold tracking-[0.5px] text-proj-white md:text-[16px]">
                  {demo.buttonLabel}
                </span>
                <ArrowUpRight size={20} weight="bold" className="text-proj-white" />
              </a>
            )}
          </div>
        </SlideIn>

        <div className="flex flex-col gap-4 md:flex-row">
          {demo.phases.map((p, i) => (
            <SlideIn key={p.phase} delay={0.25 + i * 0.08} className="flex-1">
              <div className="flex h-full flex-col gap-2 rounded-xl border border-grey-100 bg-proj-white px-5 py-4">
                <span className="font-nunito text-[11px] font-extrabold text-primary-orange">{p.phase}</span>
                <p className="font-nunito text-[16px] font-bold text-primary-black">{p.title}</p>
                <p className="font-nunito text-[13px] leading-[20px] font-normal text-[#808080]">{p.desc}</p>
              </div>
            </SlideIn>
          ))}
        </div>
      </div>
    </section>
  );
}
