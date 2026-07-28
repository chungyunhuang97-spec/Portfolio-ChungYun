"use client";

// Beanbag chair (ref: generated close-up) — a squashed glossy dome with
// radial seam creases converging at a top-center pinch point, matching the
// vinyl bean-bag look. Seams are built as tubes following the dome surface
// (not straight lines) so they read as pinched fabric, not sticks.
export const SCULPT_MODULE_ID = "beanbag-chair";

import { useMemo } from "react";
import * as THREE from "three";

function Glossy({ color, roughness = 0.16 }: { color: string; roughness?: number }) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={roughness}
      metalness={0}
      clearcoat={1}
      clearcoatRoughness={0.1}
      envMapIntensity={1.2}
    />
  );
}

function useSeamCurve(radiusX: number, radiusY: number, angle: number, rimDrop: number) {
  return useMemo(() => {
    const points: THREE.Vector3[] = [];
    const steps = 6;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps; // 0 = top pole, 1 = rim
      const phi = (Math.PI / 2) * t; // polar angle from top pole down to equator-ish
      const r = Math.sin(phi);
      const y = Math.cos(phi) * radiusY - rimDrop * t * t;
      points.push(
        new THREE.Vector3(Math.cos(angle) * r * radiusX, y, Math.sin(angle) * r * radiusX)
      );
    }
    return new THREE.CatmullRomCurve3(points);
  }, [radiusX, radiusY, angle, rimDrop]);
}

function Seam({
  radiusX,
  radiusY,
  angle,
  color,
}: {
  radiusX: number;
  radiusY: number;
  angle: number;
  color: string;
}) {
  const curve = useSeamCurve(radiusX * 1.01, radiusY * 1.01, angle, radiusY * 0.15);
  return (
    <mesh>
      <tubeGeometry args={[curve, 20, 0.045, 8, false]} />
      <Glossy color={color} roughness={0.28} />
    </mesh>
  );
}

export function BeanbagChairModel(props: { color?: string; scale?: number; seams?: number }) {
  const { color = "#2f6fc0", scale = 1, seams = 6 } = props;
  const radiusX = 1.15;
  const radiusY = 0.95;
  const seamColor = new THREE.Color(color).offsetHSL(0, 0.05, -0.08).getStyle();

  return (
    <group scale={scale} name={SCULPT_MODULE_ID}>
      <mesh position={[0, radiusY * 0.55, 0]} scale={[radiusX, radiusY, radiusX]}>
        <sphereGeometry args={[1, 48, 32]} />
        <Glossy color={color} />
      </mesh>
      <group position={[0, radiusY * 0.55, 0]}>
        {Array.from({ length: seams }).map((_, i) => (
          <Seam
            key={i}
            radiusX={radiusX}
            radiusY={radiusY}
            angle={(i / seams) * Math.PI * 2}
            color={seamColor}
          />
        ))}
      </group>
    </group>
  );
}
