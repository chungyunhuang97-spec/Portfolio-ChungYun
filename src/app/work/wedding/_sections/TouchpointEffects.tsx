"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EnvelopeSimpleOpen } from "@phosphor-icons/react/dist/ssr";

/**
 * 接觸點各自的「招牌動效」(見 docs/case-study-design-conventions.md
 * 個性層 #1) -- 跟內容意義綁定、彼此不重複的動效，疊加在共用的 SlideIn
 * 進場之上，而不是取代它。01 結婚書約刻意不加任何疊加動效（曾經試過一道
 * 簽名筆劃，Joe 看了覺得意義不明，拿掉了）-- 02 電子喜帖的「送達」通知
 * -> 03 紙本喜帖的「落到桌上」彈跳 -> 04 開場影片的「電視開機」，三個效果
 * 逐步升溫，呼應接觸點本身「數位 -> 實體 -> 動態影像」的時間順序。
 */

/** 02 電子喜帖 -- 進場後彈出一則像手機推播通知的提示再淡出，呼應「電子
 * 喜帖是數位送達」的即時感，跟 01 的紙本慢動作、03 的實體信件形成對比。
 * 需要 `relative` 的父容器才能正確疊在手機畫面上方（見呼叫端）。 */
export function NotificationPing() {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -14, scale: 0.92 }}
      whileInView={{ opacity: [0, 1, 1, 0], y: [-14, 0, 0, -6], scale: [0.92, 1, 1, 0.96] }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 2.6, times: [0, 0.18, 0.78, 1], delay: 0.6, ease: "easeInOut" }}
      className="pointer-events-none absolute inset-x-3 top-3 z-20 flex items-center gap-2 rounded-2xl bg-proj-white/95 px-3 py-2 shadow-[0px_8px_12px_rgba(64,50,42,0.12)] backdrop-blur-sm"
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-pink text-proj-white">
        <EnvelopeSimpleOpen size={13} weight="fill" />
      </span>
      <span className="font-nunito text-[10px] font-bold leading-tight text-primary-black">
        你收到一封電子喜帖
      </span>
    </motion.div>
  );
}

/** 03 紙本喜帖 -- 疊加在共用 SlideIn 之上的第二層進場動效：用更低的
 * damping 做出「信件落到桌上還彈了一下」的手感，跟 01/02 的沉穩/即時感
 * 區分開來。只動進場，不影響卡片本身既有的點擊翻面互動。 */
export function PaperLandingWrap({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: -26, rotate: -5 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", stiffness: 140, damping: 11, delay: 0.1 }}
    >
      {children}
    </motion.div>
  );
}

/** 04 婚禮開場影片 -- 進場時模擬老電視「開機」：先從一條細線瞬間撐開、
 * 伴隨一下過曝閃白，再安定成正常畫面，呼應上一輪討論「外框做成電視感」
 * 的方向，把電視感從外框延伸進動效本身，同時解決這個接觸點目前動態最
 * 薄弱、也是整條故事線收尾高潮的問題。 */
export function TVPowerOn({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <>{children}</>;
  return (
    <motion.div
      initial={{ scaleY: 0.03, opacity: 0.4, filter: "brightness(2.5)" }}
      whileInView={{ scaleY: 1, opacity: 1, filter: "brightness(1)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      style={{ transformOrigin: "center" }}
    >
      {children}
    </motion.div>
  );
}
