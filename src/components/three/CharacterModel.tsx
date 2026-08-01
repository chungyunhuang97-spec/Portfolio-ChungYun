"use client";

// Seated character at the desk. Rev 4 — face + chair updated against the
// approved isolated character turnaround (front / side / back, plain
// background, seated on the actual desk-chair design instead of the old
// placeholder panel chair).
//
// Changes from rev3:
//  - Eyebrows: stronger inward/downward angle for a more deliberate,
//    focused expression (was a near-flat 0.05 rad tilt).
//  - DeskChair: replaced the flat-panel placeholder with a real swivel
//    office chair — 5-arm star wheelbase with casters, gas-lift column,
//    swivel disc, and plump rounded seat + backrest cushions, traced from
//    the approved reference (deep glossy blue, distinct from the
//    character's cyan hoodie).
export const SCULPT_MODULE_ID = "character-seated-desk";

import { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const PALETTE = {
  skin: "#f4f2ee",
  hair: "#1d1a17",
  fabricLight: "#f1efe9", // sweatpants
  sneaker: "#f6f5f0",
  hoodieShell: "#4fc3ea",
  drawstring: "#f2efe6",
  zipper: "#c7cdd2",
  chairFabric: "#e7e1d3",
  chairFabricShadow: "#d3ccbb",
  chairBlue: "#2f6fd1",
  chairBlueDark: "#254f9e",
  pedestal: "#9a948a",
  laptopBody: "#d8d8d6",
  laptopScreen: "#14171c",
  mugBody: "#efece4",
  coffee: "#3b2418",
  decal: "#2b2925",
};

function Matte({ color, roughness = 0.4 }: { color: string; roughness?: number }) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={roughness}
      metalness={0}
      clearcoat={0.5}
      clearcoatRoughness={0.2}
      envMapIntensity={1.1}
    />
  );
}

function Porcelain({ color = PALETTE.skin, roughness = 0.28 }: { color?: string; roughness?: number }) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={roughness}
      metalness={0}
      clearcoat={0.65}
      clearcoatRoughness={0.1}
      envMapIntensity={1.5}
    />
  );
}

function HoodieShell({ dense = false }: { dense?: boolean }) {
  return (
    <meshPhysicalMaterial
      color={PALETTE.hoodieShell}
      roughness={dense ? 0.26 : 0.18}
      metalness={0}
      clearcoat={0.85}
      clearcoatRoughness={0.08}
      envMapIntensity={1.6}
      side={THREE.DoubleSide}
    />
  );
}

function CircuitTrace({
  x,
  y,
  w,
  h,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
}) {
  return (
    <group position={[x, y, 0]}>
      <mesh position={[0, 0, -0.007]}>
        <boxGeometry args={[w + 0.045, h + 0.045, 0.007]} />
        <meshBasicMaterial color="#eaffff" transparent opacity={0.7} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh>
        <boxGeometry args={[w, h, 0.014]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
    </group>
  );
}

function CircuitPad({ x, y }: { x: number; y: number }) {
  return (
    <mesh position={[x, y, -0.003]}>
      <cylinderGeometry args={[0.022, 0.022, 0.012, 12]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.95} toneMapped={false} depthWrite={false} />
    </mesh>
  );
}

function CircuitBoard({ scale = 1 }: { scale?: number }) {
  const s = scale;
  return (
    <group scale={s}>
      <mesh>
        <boxGeometry args={[0.1, 0.1, 0.016]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.007]}>
        <boxGeometry args={[0.16, 0.16, 0.007]} />
        <meshBasicMaterial color="#eaffff" transparent opacity={0.7} toneMapped={false} depthWrite={false} />
      </mesh>

      <CircuitTrace x={0} y={0.14} w={0.014} h={0.16} />
      <CircuitPad x={0} y={0.22} />
      <CircuitTrace x={0} y={-0.15} w={0.014} h={0.16} />
      <CircuitPad x={0} y={-0.23} />

      {[-1, 1].map((side) => (
        <group key={side}>
          <CircuitTrace x={side * 0.13} y={0.05} w={0.14} h={0.013} />
          <CircuitTrace x={side * 0.2} y={0.05} w={0.013} h={0.12} />
          <CircuitPad x={side * 0.2} y={0.11} />

          <CircuitTrace x={side * 0.12} y={-0.06} w={0.13} h={0.013} />
          <CircuitTrace x={side * 0.185} y={-0.12} w={0.013} h={0.12} />
          <CircuitPad x={side * 0.185} y={-0.18} />

          <CircuitTrace x={side * 0.06} y={0.16} w={0.013} h={0.1} />
          <CircuitTrace x={side * 0.1} y={0.21} w={0.09} h={0.012} />
        </group>
      ))}
    </group>
  );
}

function segmentTransform(start: [number, number, number], end: [number, number, number]) {
  const a = new THREE.Vector3(...start);
  const b = new THREE.Vector3(...end);
  const dir = new THREE.Vector3().subVectors(b, a);
  const length = dir.length();
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.clone().normalize()
  );
  return { mid, quat, length };
}

function Limb({
  start,
  end,
  radius,
  color,
  roughness = 0.5,
}: {
  start: [number, number, number];
  end: [number, number, number];
  radius: number;
  color: string;
  roughness?: number;
}) {
  const { mid, quat, length } = segmentTransform(start, end);
  return (
    <group position={mid} quaternion={quat}>
      <mesh>
        <capsuleGeometry args={[radius, Math.max(length - radius * 1.4, 0.02), 6, 12]} />
        <Matte color={color} roughness={roughness} />
      </mesh>
    </group>
  );
}

function DrawstringCord({ side }: { side: 1 | -1 }) {
  const curve = useMemo(() => {
    const points = [
      new THREE.Vector3(side * 0.06, 0.86, 0.29),
      new THREE.Vector3(side * 0.09, 0.72, 0.32),
      new THREE.Vector3(side * 0.07, 0.58, 0.33),
      new THREE.Vector3(side * 0.045, 0.46, 0.3),
    ];
    return new THREE.CatmullRomCurve3(points);
  }, [side]);
  return (
    <mesh>
      <tubeGeometry args={[curve, 20, 0.016, 8, false]} />
      <Matte color={PALETTE.drawstring} roughness={0.4} />
    </mesh>
  );
}

function DeskChair() {
  const legCount = 5;
  const legLen = 0.4;
  return (
    <group position={[0, 0, -0.4]} name="desk-chair">
      {Array.from({ length: legCount }).map((_, i) => {
        const angle = (i / legCount) * Math.PI * 2;
        const ex = Math.cos(angle) * legLen;
        const ez = Math.sin(angle) * legLen;
        return (
          <group key={i}>
            <mesh position={[ex * 0.55, 0.05, 0.4 + ez * 0.55]} rotation={[0, -angle, 0]}>
              <boxGeometry args={[legLen, 0.05, 0.07]} />
              <meshPhysicalMaterial color={PALETTE.chairBlueDark} roughness={0.3} metalness={0.25} clearcoat={0.6} />
            </mesh>
            <mesh position={[ex, 0.045, 0.4 + ez]}>
              <cylinderGeometry args={[0.045, 0.045, 0.055, 12]} />
              <meshPhysicalMaterial color={PALETTE.chairBlueDark} roughness={0.35} metalness={0.3} />
            </mesh>
          </group>
        );
      })}
      <mesh position={[0, 0.42, 0.4]}>
        <cylinderGeometry args={[0.065, 0.085, 0.72, 16]} />
        <meshPhysicalMaterial color={PALETTE.chairBlueDark} roughness={0.3} metalness={0.3} clearcoat={0.6} />
      </mesh>
      <mesh position={[0, 0.79, 0.4]}>
        <cylinderGeometry args={[0.12, 0.12, 0.05, 20]} />
        <meshPhysicalMaterial color={PALETTE.chairBlueDark} roughness={0.35} metalness={0.3} />
      </mesh>
      <RoundedBox args={[0.88, 0.18, 0.82]} radius={0.16} smoothness={4} position={[0, 0.92, 0.6]}>
        <meshPhysicalMaterial color={PALETTE.chairBlue} roughness={0.22} metalness={0} clearcoat={0.8} clearcoatRoughness={0.1} envMapIntensity={1.4} />
      </RoundedBox>
      <RoundedBox args={[0.74, 0.92, 0.18]} radius={0.3} smoothness={4} position={[0, 1.28, 0.04]} rotation={[-0.08, 0, 0]}>
        <meshPhysicalMaterial color={PALETTE.chairBlue} roughness={0.22} metalness={0} clearcoat={0.8} clearcoatRoughness={0.1} envMapIntensity={1.4} />
      </RoundedBox>
    </group>
  );
}

function Laptop() {
  return (
    <group position={[0, 1.02, 0.56]}>
      <RoundedBox args={[0.72, 0.04, 0.5]} radius={0.03} smoothness={3}>
        <meshPhysicalMaterial color={PALETTE.laptopBody} roughness={0.3} metalness={0.55} />
      </RoundedBox>
      <group position={[0, 0.02, -0.24]} rotation={[-1.15, 0, 0]}>
        <RoundedBox args={[0.72, 0.46, 0.03]} radius={0.03} smoothness={3} position={[0, 0.22, 0]}>
          <meshPhysicalMaterial color={PALETTE.laptopBody} roughness={0.3} metalness={0.55} />
        </RoundedBox>
        <RoundedBox args={[0.64, 0.38, 0.01]} radius={0.02} smoothness={3} position={[0, 0.22, 0.02]}>
          <meshPhysicalMaterial
            color={PALETTE.laptopScreen}
            roughness={0.15}
            metalness={0.1}
            emissive={"#284256"}
            emissiveIntensity={0.5}
          />
        </RoundedBox>
      </group>
    </group>
  );
}

function Mug() {
  return (
    <group position={[-0.72, 0.82, 0.3]}>
      <mesh>
        <cylinderGeometry args={[0.09, 0.08, 0.14, 20]} />
        <Matte color={PALETTE.mugBody} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.065, 0]}>
        <cylinderGeometry args={[0.075, 0.075, 0.008, 20]} />
        <meshPhysicalMaterial color={PALETTE.coffee} roughness={0.25} clearcoat={0.6} />
      </mesh>
      <mesh position={[0.11, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.045, 0.014, 10, 20, Math.PI * 1.3]} />
        <Matte color={PALETTE.mugBody} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Head({ y }: { y: number }) {
  const headR = 0.32;
  return (
    <group position={[0, y, 0.01]}>
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.13, 0.15, 0.16, 16]} />
        <Porcelain />
      </mesh>
      <mesh position={[0, 0.4, 0]} scale={[0.96, 1.04, 0.94]}>
        <sphereGeometry args={[headR, 32, 32]} />
<Porcelain />
      </mesh>
      <mesh position={[0, 0.22, 0.02]} scale={[0.8, 0.6, 0.8]}>
        <sphereGeometry args={[headR, 24, 24]} />
        <Porcelain />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (headR * 0.92), 0.38, 0.01]} scale={[0.24, 0.36, 0.16]}>
          <sphereGeometry args={[headR, 16, 16]} />
          <Porcelain />
        </mesh>
      ))}
      <mesh position={[0, 0.42, -0.01]} rotation={[0, 0, -0.06]} scale={[1.03, 1, 1.01]}>
        <sphereGeometry args={[headR * 1.05, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.34]} />
<Matte color={PALETTE.hair} roughness={0.42} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={"brow" + s} position={[s * 0.11, 0.475, headR * 0.9]} rotation={[0, 0, s * 0.17]}>
          <boxGeometry args={[0.1, 0.016, 0.015]} />
          <Matte color={PALETTE.decal} roughness={0.5} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={"eye" + s} position={[s * 0.11, 0.4, headR * 0.94]}>
          <boxGeometry args={[0.08, 0.013, 0.012]} />
          <Matte color={PALETTE.decal} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 0.34, headR * 0.97]}>
        <boxGeometry args={[0.014, 0.05, 0.012]} />
        <Matte color={PALETTE.decal} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.29, headR * 0.95]}>
        <boxGeometry args={[0.075, 0.011, 0.01]} />
        <Matte color={PALETTE.decal} roughness={0.5} />
      </mesh>
    </group>
  );
}

export function CharacterModel(props: { scale?: number }) {
  const scale = props.scale ?? 1;

  const hipY = 1.0;
  const torsoHalfW = 0.55;
  const torsoHalfH = 0.34;
  const torsoHalfD = 0.21;
  const torsoCenterY = 0.39;
  const shoulderY = hipY + torsoCenterY + torsoHalfH - 0.05;

  const armShoulder = (side: 1 | -1): [number, number, number] => [
    side * (torsoHalfW + 0.04),
    shoulderY,
    0.02,
  ];
  const armElbow = (side: 1 | -1): [number, number, number] => [side * 0.46, hipY + 0.3, 0.4];
  const armWrist = (side: 1 | -1): [number, number, number] => [side * 0.2, hipY + 0.22, 0.55];

  return (
    <group scale={scale} name={SCULPT_MODULE_ID}>
      <DeskChair />

      <Limb start={[0.22, hipY, -0.02]} end={[0.24, hipY - 0.06, 0.66]} radius={0.18} color={PALETTE.fabricLight} />
      <Limb start={[-0.22, hipY, -0.02]} end={[-0.24, hipY - 0.06, 0.66]} radius={0.18} color={PALETTE.fabricLight} />
      <Limb start={[0.24, hipY - 0.06, 0.66]} end={[0.25, 0.12, 0.5]} radius={0.155} color={PALETTE.fabricLight} />
      <Limb start={[-0.24, hipY - 0.06, 0.66]} end={[-0.25, 0.12, 0.5]} radius={0.155} color={PALETTE.fabricLight} />

      {[0.25, -0.25].map((x) => (
        <mesh key={x} position={[x, 0.14, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.14, 0.03, 10, 20]} />
          <Matte color={PALETTE.fabricLight} roughness={0.6} />
        </mesh>
      ))}

      {[0.25, -0.25].map((x) => (
        <RoundedBox
          key={x}
          args={[0.24, 0.15, 0.4]}
          radius={0.07}
          smoothness={4}
          position={[x, 0.075, 0.6]}
          rotation={[-0.08, 0, 0]}
        >
          <Matte color={PALETTE.sneaker} roughness={0.6} />
        </RoundedBox>
      ))}

      <RoundedBox args={[0.86, 0.09, 0.5]} radius={0.04} smoothness={3} position={[0, hipY + 0.02, 0.12]}>
        <Matte color={PALETTE.fabricLight} roughness={0.55} />
      </RoundedBox>
      <mesh position={[0, hipY + 0.02, 0.37]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <Matte color={PALETTE.drawstring} roughness={0.4} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.03, hipY - 0.05, 0.37]} rotation={[0.3, 0, s * 0.3]}>
          <capsuleGeometry args={[0.008, 0.07, 4, 8]} />
          <Matte color={PALETTE.drawstring} roughness={0.4} />
        </mesh>
      ))}

      <group position={[0, hipY, 0]}>
        <RoundedBox
          args={[torsoHalfW * 2, torsoHalfH * 2, torsoHalfD * 2]}
          radius={0.045}
          smoothness={4}
          position={[0, torsoCenterY, 0]}
        >
  <HoodieShell />
        </RoundedBox>

        <group position={[0, torsoCenterY + 0.05, torsoHalfD + 0.008]}>
          <CircuitBoard scale={1.5} />
        </group>

        <mesh position={[0, torsoCenterY, torsoHalfD + 0.01]}>
          <boxGeometry args={[0.02, torsoHalfH * 2 - 0.04, 0.015]} />
          <meshPhysicalMaterial color={PALETTE.zipper} roughness={0.3} metalness={0.4} />
        </mesh>

        <RoundedBox
          args={[torsoHalfW * 0.82, torsoHalfH * 0.62, 0.05]}
          radius={0.035}
          smoothness={3}
          position={[0, torsoCenterY - torsoHalfH * 0.62, torsoHalfD + 0.015]}
        >
          <HoodieShell dense />
        </RoundedBox>

        <mesh position={[0, torsoHalfH * 2 + torsoCenterY - 0.16, -0.02]} rotation={[0.55, 0, 0]}>
          <torusGeometry args={[0.26, 0.075, 12, 28]} />
          <meshPhysicalMaterial color="#3aa8d6" roughness={0.26} clearcoat={0.7} clearcoatRoughness={0.12} envMapIntensity={1.2} side={THREE.DoubleSide} />
        </mesh>

        <mesh
          position={[0, torsoHalfH * 2 + torsoCenterY + 0.02, -0.22]}
          scale={[1, 0.85, 0.8]}
        >
          <sphereGeometry args={[0.34, 28, 28, 0, Math.PI * 2, 0, Math.PI * 0.66]} />
          <meshPhysicalMaterial color="#3aa8d6" roughness={0.26} clearcoat={0.7} clearcoatRoughness={0.12} envMapIntensity={1.2} side={THREE.DoubleSide} />
        </mesh>
        <mesh
          position={[0, torsoHalfH * 2 + torsoCenterY + 0.14, -0.4]}
          rotation={[0.3, 0, 0]}
        >
          <boxGeometry args={[0.014, 0.34, 0.012]} />
          <Matte color="#a9cfe0" roughness={0.4} />
        </mesh>

        <DrawstringCord side={1} />
        <DrawstringCord side={-1} />
      </group>

      <Limb start={armShoulder(1)} end={armElbow(1)} radius={0.16} color={PALETTE.hoodieShell} roughness={0.28} />
      <Limb start={armShoulder(-1)} end={armElbow(-1)} radius={0.16} color={PALETTE.hoodieShell} roughness={0.28} />
      <Limb start={armElbow(1)} end={armWrist(1)} radius={0.1} color={PALETTE.hoodieShell} roughness={0.28} />
      <Limb start={armElbow(-1)} end={armWrist(-1)} radius={0.1} color={PALETTE.hoodieShell} roughness={0.28} />

      {[1, -1].map((side) => {
        const { mid, quat } = segmentTransform(armShoulder(side as 1 | -1), armElbow(side as 1 | -1));
        return (
          <group key={side} position={mid} quaternion={quat}>
            <group rotation={[0, side * 1.1, 0]} position={[0, 0, 0.16]}>
              <CircuitBoard scale={0.4} />
            </group>
          </group>
        );
      })}

      {[armWrist(1), armWrist(-1)].map((p, i) => (
        <mesh key={i} position={p} rotation={[0.35, 0, 0]}>
          <torusGeometry args={[0.1, 0.024, 10, 18]} />
          <HoodieShell dense />
        </mesh>
      ))}

      {[armWrist(1), armWrist(-1)].map((p, i) => (
        <mesh key={i} position={[p[0] * 0.9, p[1] - 0.02, p[2] + 0.06]} scale={[1, 0.6, 1.3]}>
          <sphereGeometry args={[0.085, 16, 16]} />
          <Porcelain />
        </mesh>
      ))}

      <Laptop />
      <Mug />
      <Head y={shoulderY + 0.08} />
    </group>
  );
}
