"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Wraps `children` in a 3D tilt that follows the cursor -- the classic
 * "holding a physical card up and turning it toward you" effect. Desktop
 * only in practice: it's driven by `pointermove`, which a touchscreen tap
 * never fires, so on mobile this is just an inert wrapper with zero
 * runtime cost beyond the extra div.
 *
 * `rotateX`/`rotateY` are springs over a raw 0..1 pointer-position motion
 * value rather than animated directly, so rapid mouse movement doesn't
 * snap the tilt -- it eases toward the new angle, which reads as the
 * object having a little physical weight. Resets to flat on pointer
 * leave, same spring.
 */
export function MouseTilt({
  children,
  className,
  maxTiltDeg = 10,
}: {
  children: ReactNode;
  className?: string;
  maxTiltDeg?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 150, damping: 18, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [0, 1], [maxTiltDeg, -maxTiltDeg]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-maxTiltDeg, maxTiltDeg]), spring);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }

  function handlePointerLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`[perspective:1200px] ${className ?? ""}`}
    >
      <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>{children}</motion.div>
    </div>
  );
}
