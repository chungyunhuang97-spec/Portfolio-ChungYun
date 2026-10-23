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

/** 02 電子喜帖 -- 疊在手機截圖畫面「上面」的推播通知膠囊，呼應「電子喜帖是
 * 數位送達」的即時感 -- 依 Figma 改版：原本是手機「下面」、寬度可超出手機
 * 本身的白色橫幅卡片；現在的參考設計把它收成一顆貼著手機螢幕下半部的小
 * 膠囊（白底、陰影、粉色圓形信封 icon），跟「查看電子喜帖」按鈕一起疊在
 * 螢幕截圖上，讀起來像手機本身彈出的系統通知，而不是版面上另一塊獨立卡
 * 片。呼叫端用 `className` 控制絕對定位的垂直位置（見 Touchpoints.tsx）。 */
export function NotificationPing({ className = "" }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -14, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 160, damping: 16, delay: 0.3 }}
      className={`absolute inset-x-0 z-10 mx-auto flex w-fit items-center gap-2 rounded-xl bg-proj-white px-3 py-2 shadow-[0px_2px_4px_rgba(9,9,9,0.2)] ${className}`}
    >
      <span className="flex size-5 shrink-0 items-center justify-center rounded-[10px] bg-accent-pink text-proj-white">
        <EnvelopeSimpleOpen size={10} weight="fill" />
      </span>
      <span className="font-nunito text-[12px] font-bold leading-tight whitespace-nowrap text-grey-800">
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
