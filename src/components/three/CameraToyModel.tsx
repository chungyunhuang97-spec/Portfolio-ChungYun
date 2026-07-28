"use client";

// Pilot object for the "procedural Three.js instead of AI video" exploration.
// Reconstructs the toy camera seen on the hero shelf (ref: 5.cam.png) as
// composable geometry + PBR materials instead of a baked video frame.
//
// SCULPT_MODULE_ID marker kept for traceability even though this build does
// not run through the automated sculpt.py pipeline (not available in this
// environment) — module ownership is still explicit and hand-reviewed.
export const SCULPT_MODULE_ID = "camera-toy-hero";

import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const PALETTE = {
  bodyCream: "#efe9df",
  bodyBlue: "#3f7fc4",
  bodyBlueLight: "#8fc7e8",
  accentOrange: "#e8792b",
  lensBlack: "#181a1e",
  chromeGray: "#c9c9c9",
  buttonGray: "#e7e7e2",
};

function GlossyPlastic({ color, roughness = 0.28 }: { color: string; roughness?: number }) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={roughness}
      metalness={0}
      clearcoat={1}
      clearcoatRoughness={0.12}
      envMapIntensity={1.1}
    />
  );
}

export function CameraToyModel(props: { scale?: number }) {
  const scale = props.scale ?? 1;

  return (
    <group scale={scale} name={SCULPT_MODULE_ID}>
      {/* Lower body — blue half */}
      <RoundedBox args={[2.3, 0.78, 1.15]} radius={0.16} smoothness={6} position={[0, -0.18, 0]}>
        <GlossyPlastic color={PALETTE.bodyBlue} />
      </RoundedBox>

      {/* Upper body — cream half */}
      <RoundedBox args={[2.3, 0.62, 1.13]} radius={0.16} smoothness={6} position={[0, 0.38, 0]}>
        <GlossyPlastic color={PALETTE.bodyCream} roughness={0.32} />
      </RoundedBox>

      {/* Viewfinder prism bump, top center */}
      <RoundedBox args={[0.55, 0.22, 0.5]} radius={0.08} smoothness={4} position={[0, 0.72, -0.05]}>
        <GlossyPlastic color={PALETTE.bodyCream} roughness={0.32} />
      </RoundedBox>
      {/* small oval button on the bump */}
      <mesh position={[0, 0.83, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.05, 0.1, 4, 12]} />
        <GlossyPlastic color={PALETTE.buttonGray} roughness={0.35} />
      </mesh>

      {/* two dark viewfinder / flash cutouts, front-top edge */}
      {[-0.78, 0.62].map((x, i) => (
        <RoundedBox
          key={i}
          args={[0.42, 0.16, 0.06]}
          radius={0.04}
          smoothness={4}
          position={[x, 0.55, 0.58]}
        >
          <meshPhysicalMaterial color={PALETTE.lensBlack} roughness={0.2} clearcoat={0.6} />
        </RoundedBox>
      ))}

      {/* small round shutter button, top right */}
      <mesh position={[0.95, 0.58, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.06, 24]} />
        <meshPhysicalMaterial color={PALETTE.chromeGray} roughness={0.25} metalness={0.1} clearcoat={1} />
      </mesh>

      {/* light-blue teardrop accent decal on the blue panel */}
      <mesh position={[-0.55, -0.2, 0.585]} rotation={[0, 0, Math.PI]}>
        <sphereGeometry args={[0.22, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
        <meshPhysicalMaterial
          color={PALETTE.bodyBlueLight}
          roughness={0.2}
          clearcoat={1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Lens assembly, centered, protruding on the blue half */}
      <group position={[0.05, -0.15, 0.55]}>
        {/* orange outer ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.42, 0.16, 24, 48]} />
          <GlossyPlastic color={PALETTE.accentOrange} roughness={0.22} />
        </mesh>
        {/* black bezel cylinder body of the lens barrel */}
        <mesh position={[0, 0, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.38, 0.4, 0.22, 40]} />
          <meshPhysicalMaterial color={PALETTE.lensBlack} roughness={0.3} clearcoat={0.6} />
        </mesh>
        {/* glossy inner lens glass */}
        <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.27, 0.27, 0.05, 40]} />
          <meshPhysicalMaterial
            color={"#0b1420"}
            roughness={0.04}
            clearcoat={1}
            clearcoatRoughness={0.02}
            envMapIntensity={1.6}
          />
        </mesh>
      </group>

      {/* small strap lug on the right side */}
      <mesh position={[1.16, 0.05, 0.3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 0.1, 16]} />
        <GlossyPlastic color={PALETTE.bodyBlue} roughness={0.3} />
      </mesh>
    </group>
  );
}
