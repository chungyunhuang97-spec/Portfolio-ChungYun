"use client";

import { motion } from "framer-motion";
import { ImageSquare } from "@phosphor-icons/react/dist/ssr";

/**
 * Placeholder for an App Mockup / screenshot / video slot that will later
 * be filled in via the CMS media upload (see spec: "Mockup [Markup]").
 * Once real media is available, swap this for an <Image>/<video> — the
 * component's rounded frame + aspect ratio can stay the same so layout
 * doesn't shift.
 */
export function MockupSlot({
  label = "Mockup 素材待上傳",
  aspect = "aspect-[9/19]",
  float = false,
  className = "",
}: {
  label?: string;
  aspect?: string;
  float?: boolean;
  className?: string;
}) {
  const content = (
    <div
      className={`flex ${aspect} w-full flex-col items-center justify-center gap-3 rounded-[32px] border-2 border-dashed border-grey-300 bg-grey-50 text-grey-500 ${className}`}
    >
      <ImageSquare size={32} weight="light" />
      <p className="font-nunito px-6 text-center text-[12px] font-bold md:text-[14px]">
        {label}
      </p>
    </div>
  );

  if (!float) return content;

  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      {content}
    </motion.div>
  );
}
