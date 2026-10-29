"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "@phosphor-icons/react/dist/ssr";

/**
 * Full-screen overlay for a brief screenshot. Closes on ESC or a click on
 * the dimmed backdrop (not the image itself, so a tap on the image doesn't
 * immediately dismiss it on touch devices).
 */
export function BriefLightbox({
  imageUrl,
  alt,
  onClose,
}: {
  imageUrl: string;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={alt}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-6"
        onClick={onClose}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="關閉放大圖"
          className="absolute top-5 right-5 text-bg transition-opacity hover:opacity-70"
        >
          <X size={28} weight="light" />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element -- lightbox renders arbitrary Supabase Storage URLs */}
        <img
          src={imageUrl}
          alt={alt}
          onClick={(e) => e.stopPropagation()}
          className="max-h-full max-w-full rounded-lg object-contain"
        />
      </motion.div>
    </AnimatePresence>
  );
}
