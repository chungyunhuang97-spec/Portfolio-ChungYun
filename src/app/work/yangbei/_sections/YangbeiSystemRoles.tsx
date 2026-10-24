"use client";

import { UserCircle, ChalkboardTeacher, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { motion } from "framer-motion";
import { SlideIn } from "@/components/design-system/SlideIn";
import type { YangbeiPlatform as Platform } from "../types";

interface SystemRole {
  role: string;
  system: string;
  desc: string;
}

const ICONS = [UserCircle, ChalkboardTeacher, ShieldCheck];

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.12, ease: EASE },
  }),
};

/**
 * 系統角色說明 — a quick "who uses what" orientation before the three video
 * walkthroughs below, so the viewer knows which system each role belongs to
 * before watching it in action. Content from `process.systemRoles`
 * (role/system/desc), colored per `process.platforms[i].color` by position
 * so each card stays visually tied to the same 前台/中台/後台 identity used
 * throughout the rest of the page.
 */
export function YangbeiSystemRoles({ process }: { process: Record<string, unknown> }) {
  const roles = Array.isArray(process.systemRoles) ? (process.systemRoles as SystemRole[]) : [];
  const platforms = Array.isArray(process.platforms) ? (process.platforms as Platform[]) : [];

  if (roles.length === 0) return null;

  return (
    <section className="bg-grey-50 px-6 py-16 md:px-[120px] md:py-[80px]">
      <SlideIn delay={0.05}>
        <div className="mb-10 flex flex-col items-center gap-3 text-center md:mb-14">
          <span className="font-nunito text-[13px] font-extrabold tracking-[1px] text-primary-black/40 uppercase">
            Who&apos;s Who
          </span>
          <h2 className="font-nunito text-[28px] leading-[38px] font-bold text-primary-black md:text-[44px] md:leading-[56px]">
            一套系統，三種角色
          </h2>
          <p className="font-nunito max-w-[560px] text-[14px] leading-[22px] text-grey-600 md:text-[16px] md:leading-[26px]">
            在看接下來的三段操作影片之前，先搞清楚每個角色在系統裡能做什麼
          </p>
        </div>
      </SlideIn>

      <motion.div
        className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      >
        {roles.map((item, i) => {
          const Icon = ICONS[i % ICONS.length];
          const color = platforms[i]?.color ?? "#FF520D";
          return (
            <motion.div
              key={item.role}
              custom={i}
              variants={cardVariants}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex flex-col gap-4 rounded-2xl border border-grey-100 bg-proj-white p-6 shadow-[0px_8px_12px_rgba(64,50,42,0.06),0px_1.5px_1.5px_rgba(64,50,42,0.04)]"
            >
              <span
                className="flex size-12 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${color}1A`, color }}
                aria-hidden
              >
                <Icon size={24} weight="bold" />
              </span>

              <div className="flex flex-col gap-1.5">
                <span className="font-nunito text-[18px] font-bold text-primary-black">{item.role}</span>
                <span
                  className="font-nunito inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                  style={{ backgroundColor: `${color}1A`, color }}
                >
                  {item.system}
                </span>
              </div>

              <p className="font-nunito text-[13px] leading-[20px] text-grey-600 md:text-[14px] md:leading-[22px]">
                {item.desc}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
