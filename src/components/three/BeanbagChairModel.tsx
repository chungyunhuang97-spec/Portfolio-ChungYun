"use client";

// Beanbag chair (ref: generated close-up) — a puffy glossy body with a real
// seat pocket dented into the top center: deep enough that it reads as
// "someone could sit down into the middle of it", not just a shallow dimple.
// The pocket is actual geometry (a lathed profile that rises to a rim then
// drops steeply to a floor well below it), and the radial seams are tubes
// that ride that same rim-then-drop path so they visually converge at the
// bottom of the seat pocket.
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
// bottom pole, out through the belly, up the shoulder, up to the raised rim
// of the seat pocket (the highest point), then steeply back down and in to
// the pocket floor — a big rim-to-floor drop so the dent reads as a real
// seat, not a surface crease.
const BODY_PROFILE: [number, number][] = [
  [0.0, 0.0],
  [0.5, 0.02],
  [0.88, 0.16],
  [1.0, 0.4], // widest belly
  [0.95, 0.62], // shoulder
  [0.8, 0.8], // rising toward the seat rim
  [0.6, 0.94], // seat rim — highest point
  [0.46, 0.88], // just inside the rim, start of the inner wall
  [0.28, 0.62], // steep inner wall dropping into the seat pocket
  [0.12, 0.46],
  [0.0, 0.42], // seat pocket floor — well below the rim (0.94 -> 0.42)
];

// Same path, trimmed to just the upper portion (shoulder -> pocket floor)
// since the reference shows seam creases only on the upper dome, fading out
// before the wide belly.
const SEAM_PROFILE: [number, number][] = [
  [0.95, 0.62],
  [0.8, 0.8],
  [0.6, 0.94],
  [0.46, 0.88],
  [0.28, 0.62],
  [0.12, 0.46],
  [0.0, 0.42],
];

function useBodyGeometry() {
  return useMemo(() => {
    const spline = new THREE.SplineCurve(BODY_PROFILE.map(([r, y]) => new THREE.Vector2(r, y)));
    const pts = spline.getPoints(56);
    return new THREE.LatheGeometry(pts, 56);
  }, []);
}

function useSeamCurve(angle: number, scaleX: number, scaleY: number) {
  return useMemo(() => {
    const spline = new THREE.SplineCurve(SEAM_PROFILE.map(([r, y]) => new THREE.Vector2(r, y)));
    const pts2d = spline.getPoints(28);
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
      <tubeGeometry args={[curve, 28, 0.042, 8, false]} />
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
