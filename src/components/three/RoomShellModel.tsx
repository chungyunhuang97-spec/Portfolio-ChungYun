"use client";

// Procedural room shell — the architectural "empty box" the hero scene sits
// inside: two angled walls meeting at a back corner, floor, the thick rounded
// blue trim framing, the arched doorway (with a glimpsed warm room beyond),
// the empty arched alcove that will later hold the shelf furniture, and the
// three flat wall-decor plaques. Furnishings (desk, character, shelf
// contents, rug, beanbags, plant, cap) are separate modules composed inside
// this shell later — this file owns architecture only.
export const SCULPT_MODULE_ID = "room-shell";

import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const PALETTE = {
  wall: "#efe9df",
  trimBlue: "#1978d8",
  floor: "#c98f52",
  floorDark: "#b87d43",
  doorGlow: "#f0b25a",
  nicheInner: "#e2dccf",
  plaqueBlue: "#1e6fc4",
  plaqueOrange: "#e07a2c",
  plaquePink: "#e9a9c2",
  dotOrange: "#e8792b",
  dotPink: "#f0a8c0",
};

function Matte({ color, roughness = 0.55 }: { color: string; roughness?: number }) {
  return <meshStandardMaterial color={color} roughness={roughness} metalness={0} />;
}

function GlossyTrim({ color = PALETTE.trimBlue }: { color?: string }) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={0.25}
      clearcoat={1}
      clearcoatRoughness={0.15}
      metalness={0}
    />
  );
}

/** Thick rounded tube trim running along one straight edge, drei-free (plain capsule). */
function TrimBar({
  length,
  position,
  rotation,
}: {
  length: number;
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <capsuleGeometry args={[0.22, length, 6, 16]} />
      <GlossyTrim />
    </mesh>
  );
}

/** One flat wall-decor plaque: rounded backing + a raised blob accent. */
function WallPlaque({
  position,
  rotation,
  backing,
  accent,
  accentShape = "circle",
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  backing: string;
  accent: string;
  accentShape?: "circle" | "squiggle" | "blob";
}) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[1.6, 2.4, 0.18]} radius={0.28} smoothness={4}>
        <Matte color={backing} roughness={0.4} />
      </RoundedBox>
      {accentShape === "circle" && (
        <>
          <mesh position={[0.05, 0.5, 0.12]}>
            <sphereGeometry args={[0.55, 24, 24]} />
            <Matte color={accent} roughness={0.4} />
          </mesh>
          <mesh position={[-0.35, -0.05, 0.12]} scale={[1, 0.6, 0.5]}>
            <sphereGeometry args={[0.22, 16, 16]} />
            <Matte color={PALETTE.dotPink} roughness={0.4} />
          </mesh>
        </>
      )}
      {accentShape === "squiggle" &&
        [0.75, 0.25, -0.25, -0.75].map((y, i) => (
          <mesh key={i} position={[i % 2 === 0 ? 0.15 : -0.15, y, 0.12]}>
            <sphereGeometry args={[0.32, 16, 16]} />
            <Matte color={PALETTE.dotPink} roughness={0.4} />
          </mesh>
        ))}
      {accentShape === "blob" && (
        <>
          <mesh position={[0.15, 0.4, 0.12]} scale={[1, 1.2, 0.6]}>
            <sphereGeometry args={[0.5, 24, 24]} />
            <Matte color={accent} roughness={0.4} />
          </mesh>
          <mesh position={[-0.1, -0.35, 0.12]}>
            <sphereGeometry args={[0.4, 24, 24]} />
            <Matte color={PALETTE.plaqueBlue} roughness={0.4} />
          </mesh>
        </>
      )}
    </group>
  );
}

/** Rounded arch outline (doorway / alcove), built from a partial torus + two legs. */
function ArchFrame({
  position,
  width = 2.2,
  height = 3.2,
  depth = 0.3,
}: {
  position: [number, number, number];
  width?: number;
  height?: number;
  depth?: number;
}) {
  const radius = width / 2;
  const legHeight = height - radius;
  return (
    <group position={position}>
      {/* half-torus cap */}
      <mesh position={[0, legHeight, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.24, 12, 32, Math.PI]} />
        <GlossyTrim />
      </mesh>
      {/* two vertical legs */}
      <mesh position={[-radius, legHeight / 2, 0]}>
        <capsuleGeometry args={[0.24, legHeight, 6, 16]} />
        <GlossyTrim />
      </mesh>
      <mesh position={[radius, legHeight / 2, 0]}>
        <capsuleGeometry args={[0.24, legHeight, 6, 16]} />
        <GlossyTrim />
      </mesh>
      {/* recessed opening plane behind the frame */}
      <mesh position={[0, legHeight / 2, -depth]}>
        <planeGeometry args={[width - 0.3, height - 0.15]} />
        <meshStandardMaterial color={PALETTE.doorGlow} roughness={0.8} />
      </mesh>
    </group>
  );
}

export function RoomShellModel() {
  return (
    <group name={SCULPT_MODULE_ID}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 10]} />
        <Matte color={PALETTE.floor} roughness={0.6} />
      </mesh>
      {/* floor rounded blue perimeter trim (front edge only, simplified) */}
      <TrimBar length={9.6} position={[0, 0.1, 4.9]} rotation={[0, 0, Math.PI / 2]} />

      {/* Left wall */}
      <group position={[-3.5, 0, -2]} rotation={[0, Math.PI / 8, 0]}>
        <RoundedBox args={[7, 6.4, 0.3]} radius={0.05} position={[0, 3.2, 0]}>
          <Matte color={PALETTE.wall} roughness={0.65} />
        </RoundedBox>
        {/* doorway, upper-left area of this wall */}
        <ArchFrame position={[-1.8, 0, 0.2]} width={2.1} height={3.6} depth={0.35} />
        {/* two decor plaques to the right of the doorway */}
        <WallPlaque
          position={[1.1, 3.6, 0.22]}
          rotation={[0, 0, 0]}
          backing={PALETTE.plaqueBlue}
          accent={PALETTE.dotOrange}
          accentShape="circle"
        />
        <WallPlaque
          position={[2.9, 3.6, 0.22]}
          rotation={[0, 0, 0]}
          backing={PALETTE.plaqueOrange}
          accent={PALETTE.dotPink}
          accentShape="squiggle"
        />
        {/* trim along the top edge of this wall */}
        <TrimBar length={7} position={[0, 6.4, 0]} rotation={[0, 0, Math.PI / 2]} />
      </group>

      {/* Right wall */}
      <group position={[3.5, 0, -2]} rotation={[0, -Math.PI / 8, 0]}>
        <RoundedBox args={[7, 6.4, 0.3]} radius={0.05} position={[0, 3.2, 0]}>
          <Matte color={PALETTE.wall} roughness={0.65} />
        </RoundedBox>
        {/* empty alcove — shelf furniture module docks here later */}
        <ArchFrame position={[-1.4, 0, 0.2]} width={2.6} height={4.2} depth={0.4} />
        {/* far-right decor plaque */}
        <WallPlaque
          position={[2.6, 3.6, 0.22]}
          rotation={[0, 0, 0]}
          backing={PALETTE.plaquePink}
          accent={PALETTE.plaqueOrange}
          accentShape="blob"
        />
        <TrimBar length={7} position={[0, 6.4, 0]} rotation={[0, 0, Math.PI / 2]} />
      </group>

      {/* outer corner trim where the two walls meet */}
      <TrimBar length={6.4} position={[0, 3.2, -2.6]} rotation={[0, 0, 0]} />
    </group>
  );
}
