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

/**
 * 前端開發協作與 Demo (Frontend Demo), not itself one of the 7 numbered
 * regions in the interaction spec -- it's the bridge between UI Flow and
 * User Testing that carries the "與工程師協作、產出 GitHub Pages Demo"
 * narrative Joe's project history already establishes (see the project's
 * own `outcome.demo_url`, already pointing at
 * https://jing607.github.io/Nest_Stay/). Kept as its own file rather than
 * folded into UIFlow/UserTesting per this codebase's one-concept-per-file
 * convention.
 *
 * Content model: reuses `process.frontendDemo` (single nested object:
 * `teamComposition`, `devTimeline`, `output`, `phases` [3× {phase, title,
 * desc}], `buttonLabel`). The CTA links to `project.external_url` (already
 * set to the live demo), falling back to nothing if unset.
 *
 * Static meta row (team/timeline/output) + 3-card phase timeline, same
 * card treatment (bordered, off-white) used throughout this page's other
 * sections for visual consistency.
 */
export function FrontendDemo({ project, process }: { project: Project; process: Record<string, unknown> }) {
  const demo = process.frontendDemo as FrontendDemoContent | undefined;
  if (!demo) return null;

  return (
    <section className="bg-grey-50 px-6 py-12 md:px-[120px] md:py-[100px]">
      <div className="flex flex-col gap-8 md:gap-12">
        <SlideIn delay={0.1}>
          <div className="flex flex-col gap-3">
            <span className="font-nunito text-[13px] font-extrabold tracking-[2px] text-secondary-blue uppercase">
              Frontend Collaboration &amp; Demo
            </span>
            <h3 className="font-nunito text-[26px] leading-[34px] font-bold text-primary-black md:text-[36px] md:leading-[48px]">
              前端開發協作與 Demo
            </h3>
            <div className="flex flex-wrap gap-x-6 gap-y-1 font-nunito text-[13px] font-semibold text-grey-600 md:text-[14px]">
              <span>{demo.teamComposition}</span>
              <span>·</span>
              <span>{demo.devTimeline}</span>
              <span>·</span>
              <span>{demo.output}</span>
            </div>
          </div>
        </SlideIn>

        <div className="flex flex-col gap-4 md:flex-row md:gap-6">
          {demo.phases.map((p, i) => (
            <SlideIn key={p.phase} delay={0.15 + i * 0.08} className="flex-1">
              <div className="flex h-full flex-col gap-2 rounded-2xl border border-[#e5e0db] bg-proj-white p-6">
                <span className="font-nunito w-fit rounded-full bg-secondary-blue px-3 py-1 text-[11px] font-bold text-proj-white">
                  {p.phase}
                </span>
                <p className="font-nunito text-[16px] font-bold text-primary-black">{p.title}</p>
                <p className="font-nunito text-[13px] leading-[20px] font-normal text-grey-600">{p.desc}</p>
              </div>
            </SlideIn>
          ))}
        </div>

        {project.external_url && (
          <SlideIn delay={0.3}>
            <a
              href={project.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-primary-orange px-6 py-3 shadow-[0_4px_12px_rgba(255,82,13,0.25)] transition-transform hover:-translate-y-0.5"
            >
              <span className="font-nunito text-[14px] font-bold text-proj-white">{demo.buttonLabel}</span>
              <ArrowUpRight size={18} weight="bold" className="text-proj-white" />
            </a>
          </SlideIn>
        )}
      </div>
    </section>
  );
}
