"use client";

// Standalone wooden shelf unit inside its blue arch frame (ref: generated
// empty-shelf close-up). Distinct from RoomShellModel's wall-recessed
// ArchFrame -- this is the freestanding furniture version so it can be
// dropped into the room shell's alcove and later hold the camera / blocks /
// radio modules as children.
export const SCULPT_MODULE_ID = "shelf-unit";

import { RoundedBox } from "@react-three/drei";

function GlossyTrim({ color = "#1860be" }: { color?: string }) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={0.22}
      clearcoat={1}
      clearcoatRoughness={0.15}
      metalness={0}
    />
  );
}

function Wood({ color = "#dc842c" }: { color?: string }) {
  return <meshPhysicalMaterial color={color} roughness={0.35} clearcoat={0.4} metalness={0} />;
}

export function ShelfUnitModel(props: { scale?: number }) {
  const scale = props.scale ?? 1;
  const width = 2.4;
  const height = 3.42; // measured ratio ~1:1.42 (width:height) from reference photo
  const depth = 0.9;
  const radius = width / 2;
  const legHeight = height - radius;

  const shelfYs = [legHeight * 0.62, legHeight * 0.35, legHeight * 0.08];

  return (
    <group scale={scale} name={SCULPT_MODULE_ID}>
      {/* arch cap */}
      <mesh position={[0, legHeight, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.32, 16, 40, Math.PI]} />
        <GlossyTrim />
      </mesh>
      {/* two side posts */}
      <mesh position={[-radius, legHeight / 2, 0]}>
        <capsuleGeometry args={[0.32, legHeight, 8, 20]} />
        <GlossyTrim />
      </mesh>
      <mesh position={[radius, legHeight / 2, 0]}>
        <capsuleGeometry args={[0.32, legHeight, 8, 20]} />
        <GlossyTrim />
      </mesh>
      {/* back panel so the niche reads as enclosed, not a hollow ring */}
      <mesh position={[0, legHeight * 0.55, -depth / 2 + 0.05]}>
        <planeGeometry args={[width - 0.4, height - 0.2]} />
        <meshStandardMaterial color="#efe9df" roughness={0.7} />
      </mesh>
      {/* three wooden shelf planks */}
      {shelfYs.map((y, i) => (
        <RoundedBox
          key={i}
          args={[width - 0.65, 0.16, depth - 0.15]}
          radius={0.06}
          smoothness={4}
          position={[0, y, 0]}
        >
          <Wood />
        </RoundedBox>
      ))}
    </group>
  );
}
