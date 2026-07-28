"use client";

// Beanbag chair (ref: generated close-up) — a squashed glossy pouf with a
// concave pinch/dent at the top center (not a smooth round dome — the seams
// converge into an actual crater, like a real bean-bag's stitched top).
// Body is a lathed profile (bottom pole -> belly -> shoulder -> dimple rim ->
// down into the dimple floor) so the dent is real geometry, not just a
// texture trick. Seams are tubes following that same surface path.
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

// Cross-section profile in unit space: [radius, height], traced from the
// bottom pole, out through the belly, up the shoulder, over the outer rim of
// the top dimple (the highest point), then back down and in to the dimple's
// center floor — that last up-then-down segment is what creates the dent.
const BODY_PROFILE: [number, number][] = [
  [0.0, 0.0],
  [0.55, 0.02],
  [0.92, 0.18],
  [1.0, 0.42],
  [0.9, 0.68],
  [0.62, 0.86],
  [0.34, 0.955], // outer rim of the dimple — highest point
  [0.14, 0.9], // dimple inner wall, curving back down
  [0.0, 0.845], // dimple floor / seam convergence point (lower than the rim)
];

// Same path, trimmed to just the upper portion (shoulder -> dimple floor)
// since the reference shows seam creases only on the upper dome, fading out
// before the wide belly.
const SEAM_PROFILE: [number, number][] = [
  [0.92, 0.18],
  [1.0, 0.42],
  [0.9, 0.68],
  [0.62, 0.86],
  [0.34, 0.955],
  [0.14, 0.9],
  [0.0, 0.845],
];

function useBodyGeometry() {
  return useMemo(() => {
    const spline = new THREE.SplineCurve(BODY_PROFILE.map(([r, y]) => new THREE.Vector2(r, y)));
    const pts = spline.getPoints(48);
    return new THREE.LatheGeometry(pts, 48);
  }, []);
}

function useSeamCurve(angle: number, scaleX: number, scaleY: number) {
  return useMemo(() => {
    const spline = new THREE.SplineCurve(SEAM_PROFILE.map(([r, y]) => new THREE.Vector2(r, y)));
    const pts2d = spline.getPoints(24);
    const points = pts2d.map(
      (p) => new THREE.Vector3(Math.cos(angle) * p.x * scaleX, p.y * scaleY, Math.sin(angle) * p.x * scaleX)
    );
    return new THREE.CatmullRomCurve3(points);
  }, [angle, scaleX, scaleY]);
}

function Seam({
  angle,
  scaleX,
  scaleY,
  color,
}: {
  angle: number;
  scaleX: number;
  scaleY: number;
  color: string;
}) {
  // Scale is baked directly into the curve's point positions (not a group
  // scale) so the tube's circular cross-section doesn't get squashed into an
  // ellipse by non-uniform x/y scaling.
  const curve = useSeamCurve(angle, scaleX, scaleY);
  return (
    <mesh>
      <tubeGeometry args={[curve, 24, 0.042, 8, false]} />
      <Glossy color={color} roughness={0.28} />
    </mesh>
  );
}

export function BeanbagChairModel(props: { color?: string; scale?: number; seams?: number }) {
  const { color = "#2f6fc0", scale = 1, seams = 6 } = props;
  const radiusX = 1.15;
  const radiusY = 0.95;
  const seamColor = new THREE.Color(color).offsetHSL(0, 0.05, -0.08).getStyle();
  const bodyGeometry = useBodyGeometry();

  return (
    <group scale={scale} name={SCULPT_MODULE_ID}>
      <mesh geometry={bodyGeometry} scale={[radiusX, radiusY, radiusX]}>
        <Glossy color={color} />
      </mesh>
      {Array.from({ length: seams }).map((_, i) => (
        <Seam
          key={i}
          angle={(i / seams) * Math.PI * 2}
          scaleX={radiusX * 1.01}
          scaleY={radiusY * 1.01}
          color={seamColor}
        />
      ))}
    </group>
  );
}
