import { DisplayHero, BodyLarge, LabelSmall } from "@/components/design-system/Typography";
import { Tag } from "@/components/design-system/Tag";
import { PhoneFrame } from "@/components/design-system/PhoneFrame";

const KICKER = "UI/UX DESIGN PROJECT";
const TITLE = "2025 捷運盃黑客松";
const BODY =
  "重新定義大眾運輸體驗，從介面設計與服務創新出發，為百萬通勤乘客打造最溫柔的數位解答。";

/**
 * Section 1 — Hero. White background.
 *
 * Desktop: wide text column (max 749px) + fixed-width phone mockup (259px)
 * anchored right, vertically centered as one row.
 * Mobile: kicker + title stacked, then the phone mockup, then the body
 * copy below it — a different sequence from desktop (per Figma), and the
 * chip tags are dropped on mobile to keep the section inside 100vh.
 * Rendered as two structurally distinct blocks (toggled via `md:hidden` /
 * `hidden md:flex`) rather than fought into one shared flex order, since
 * the grouping — not just the order — differs between breakpoints.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-proj-white px-6 pt-[104px] pb-16 md:flex md:min-h-screen md:items-center md:px-[176px] md:py-0">
      {/* Mobile layout */}
      <div className="flex flex-col md:hidden">
        <LabelSmall className="text-primary-orange">{KICKER}</LabelSmall>
        <DisplayHero className="mt-4 text-primary-black">{TITLE}</DisplayHero>

        <div className="mx-auto mt-8 w-[62%] max-w-[240px]">
          <PhoneFrame />
        </div>

        <BodyLarge className="mt-8 text-grey-700">{BODY}</BodyLarge>
      </div>

      {/* Desktop layout */}
      <div className="hidden w-full items-center justify-between gap-x-20 md:flex">
        <div className="w-[749px] shrink-0">
          <LabelSmall className="text-primary-orange">{KICKER}</LabelSmall>
          <DisplayHero className="mt-5 whitespace-nowrap text-primary-black">
            {TITLE}
          </DisplayHero>
          <BodyLarge className="mt-5 max-w-[610px] text-grey-700">{BODY}</BodyLarge>
          <div className="mt-5 flex gap-4">
            <Tag variant="orange">智慧引導</Tag>
            <Tag variant="orange">安心陪伴</Tag>
          </div>
        </div>

        <div className="w-[259px] shrink-0">
          <PhoneFrame />
        </div>
      </div>
    </section>
  );
}
