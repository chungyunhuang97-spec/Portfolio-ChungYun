"use client";

import { useEffect } from "react";

/**
 * Click feedback for the whole admin: a lime ring expands from the pointer
 * whenever a button, link, summary or card is pressed. The ring is a fixed,
 * pointer-events-none element, so it never changes layout or steals clicks.
 */
export function AdminClickFx() {
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement | null;
      const pressable = target?.closest('button:not(:disabled), a[href], summary, [role="button"], .admin-press, label[for]');
      if (!pressable || !pressable.closest(".admin-shell")) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const ring = document.createElement("span");
      ring.className = "admin-ripple";
      ring.style.left = `${e.clientX}px`;
      ring.style.top = `${e.clientY}px`;
      document.body.appendChild(ring);
      ring.addEventListener("animationend", () => ring.remove(), { once: true });
    }
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return null;
}
