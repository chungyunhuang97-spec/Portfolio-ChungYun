"use client";

// Procedural "inflated balloon" blob — metaball-merged lobes with a glossy
// plastic/latex material, matching the puffy toy reference Joe shared.
// Built with three's MarchingCubes so the lobes pinch together smoothly
// instead of reading as separate spheres glued together.
export const SCULPT_MODULE_ID = "inflated-blob-decor";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { MarchingCubes } from "three/examples/jsm/objects/MarchingCubes.js";
import { useFrame } from "@react-three/fiber";

interface InflatedBlobProps {
  color?: string;
  /** number of radiating arms — 3 = clover/pinwheel, 5-7 = spiky star */
  arms?: number;
  /** how tapered the arm tips are — higher = pointier fingers */
  taper?: number;
  scale?: number;
  spin?: boolean;
}

export function InflatedBlobModel({
  color = "#d94f4f",
  arms = 4,
  taper = 0.55,
  scale = 1,
  spin = true,
}: InflatedBlobProps) {
  const groupRef = useRef<THREE.Group>(null);

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.22,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        sheen: 1,
        sheenColor: new THREE.Color(color).offsetHSL(0, 0, 0.25),
        sheenRoughness: 0.4,
        envMapIntensity: 1.2,
      }),
    [color]
  );

  const mc = useMemo(() => {
    const resolution = 48;
    const m = new MarchingCubes(resolution, material, true, false, 65000);
    m.isolation = 60;
    m.scale.setScalar(scale * 1.6);
    return m;
  }, [material, scale]);

  useEffect(() => {
    mc.reset();

    // central body
    mc.addBall(0.5, 0.5, 0.5, 0.9, 12, undefined as unknown as THREE.Color);

    // radiating tapered arms — each arm is a chain of two shrinking balls
    // so the metaball field pinches into a rounded point at the tip,
    // matching the puffy "inflated finger" look in the reference.
    for (let i = 0; i < arms; i++) {
      const angle = (i / arms) * Math.PI * 2;
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);
      const midR = 0.24;
      const tipR = 0.4;
      mc.addBall(0.5 + dx * midR, 0.5 + dy * midR, 0.5, 0.6, 12, undefined as unknown as THREE.Color);
      mc.addBall(
        0.5 + dx * tipR,
        0.5 + dy * tipR,
        0.5,
        0.6 * taper,
        12,
        undefined as unknown as THREE.Color
      );
    }

    mc.update();
  }, [mc, arms, taper]);

  useFrame((_, delta) => {
    if (spin && groupRef.current) groupRef.current.rotation.y += delta * 0.25;
  });

  return (
    <group ref={groupRef} name={SCULPT_MODULE_ID}>
      <primitive object={mc} />
    </group>
  );
}
