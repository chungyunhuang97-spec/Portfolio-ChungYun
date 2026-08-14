import { DisplayHero, BodyLarge, LabelSmall } from "@/components/design-system/Typography";
import { Tag } from "@/components/design-system/Tag";
import { MockupSlot } from "@/components/design-system/MockupSlot";

/**
 * Section 1 — Hero.
 * Layout: left copy + right App Mockup. White background.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-proj-white px-6 pb-16 pt-32 md:px-16 md:pb-24 md:pt-44">
      <div className="mx-auto grid max-w-[1280px] items-center gap-12 md:grid-cols-2 md:gap-16">
        <div>
          <LabelSmall className="text-primary-orange">UI/UX DESIGN PROJECT</LabelSmall>

          <DisplayHero className="mt-4 text-primary-black">
            2025 捷運盃黑客松
          </DisplayHero>

          <BodyLarge className="mt-6 max-w-[46ch] text-grey-700">
            重新定義大眾運輸體驗，從介面設計與服務創新出發，為百萬通勤乘客打造最溫柔的數位解答。
          </BodyLarge>

          <div className="mt-8 flex flex-wrap gap-3">
            <Tag variant="orange">智慧引導</Tag>
            <Tag variant="orange">安心陪伴</Tag>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[320px] md:max-w-[360px]">
          {/* Mobile: mockup floats. Desktop: static, per spec. */}
          <div className="md:hidden">
            <MockupSlot label="App Mockup（影片/圖片，後臺可上傳）" float />
          </div>
          <div className="hidden md:block">
            <MockupSlot label="App Mockup（影片/圖片，後臺可上傳）" />
          </div>
        </div>
      </div>
    </section>
  );
}
