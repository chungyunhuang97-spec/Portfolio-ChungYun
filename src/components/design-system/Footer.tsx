/**
 * Page footer for case-study pages — same reuse tier as <Navbar />
 * (Figma desktop 127:698 "Footer1" / mobile 151:589), meant to sit under
 * every project page, not just metro. Figma's own two instances differ in
 * more than just breakpoint sizing: desktop lays copyright + credit out as
 * a `justify-between` row with a 1px #1A1A1A top border; mobile stacks them
 * with an 8px gap and (per get_design_context) no top border at all — both
 * are reproduced literally rather than forcing symmetry between them.
 *
 * `copyright` is the one piece of copy this component takes as a prop
 * rather than hardcoding, per Joe's explicit ask: other project pages that
 * reuse this component need their own left-hand copyright line editable
 * from the admin — it's wired to the new `projects.footer_copyright`
 * column (edited via the DETAILS form, same tier as `category`/`subtitle`)
 * rather than a `project_sections` JSON field, since it's page-chrome
 * metadata that lives once per project, not case-study body content.
 * `designerCredit` is NOT CMS-wired (no requirement for it to vary per
 * project) — it's a plain prop with a sensible default so it stays
 * trivially overridable in code later without a schema change.
 *
 * Text color `#e6e6e6` is written as a literal hex, not the `grey-100`
 * token — this project's `grey-100` (`#f0f0f0`) doesn't match Figma's
 * `Grey/100` (`#e6e6e6`) value used here, same mismatch already documented
 * and worked around the same way in Results.tsx / SystemArchitecture.tsx.
 *
 * Bottom padding bumped 8/20 per Joe's report ("footer 有點太擠了") — the
 * original `pb-6`/`pb-12` was much smaller than the `pt-32` on the same
 * block, so the copy sat close against the very bottom edge of the page
 * with little breathing room below it. Figma's own frame doesn't spec a
 * bottom-edge margin (the canvas just ends at the content), so this is a
 * judgment call the same way Closing's background motion was — increased
 * to `pb-12`/`pb-20` and the mobile line-gap widened slightly too, keeping
 * the existing `pt-32` and border/layout untouched.
 */
export function Footer({
  copyright,
  designerCredit = "Designed by Huang Chung Yun",
}: {
  copyright: string;
  designerCredit?: string;
}) {
  return (
    <footer className="bg-primary-orange">
      {/* Mobile layout */}
      <div className="flex flex-col gap-3 px-6 pt-32 pb-12 md:hidden">
        <p className="font-nunito text-[13px] font-normal leading-[20px] text-[#e6e6e6]">
          {copyright}
        </p>
        <p className="font-nunito text-[13px] font-normal leading-[20px] text-[#e6e6e6]">
          {designerCredit}
        </p>
      </div>

      {/* Desktop layout */}
      <div className="hidden items-start justify-between border-t border-[#1a1a1a] px-[120px] pt-32 pb-20 md:flex">
        <p className="font-nunito text-[14px] font-normal leading-[21px] text-[#e6e6e6]">
          {copyright}
        </p>
        <p className="font-nunito text-[14px] font-normal leading-[21px] text-[#e6e6e6]">
          {designerCredit}
        </p>
      </div>
    </footer>
  );
}
