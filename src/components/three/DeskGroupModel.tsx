"use client";

// Desk-group furnishings, built from the approved four-angle desk-group
// reference (front / top-down / back / three-quarter-back). Front view is
// the primary source; the other three are used only to resolve depth and
// left/right relationships the front view can't show. Composed as one
// module so the whole group can be dropped into a scene and iterated on
// together: table, monitor + keyboard + mouse, desk camera, retro radio,
// pencil cup + cap-shaped desk lamp, coffee glass, potted plant, and the
// round patterned rug underneath. The beanbag reuses the existing
// BeanbagChairModel with an orange color override rather than a new mesh.
//
// Rev 2 — fixed a build-breaking type error: cylinderGeometry doesn't
// accept a `rotation` prop (rotation belongs on the parent mesh), which
// blocked the Vercel deploy. Moved the rotation up to the <mesh> in
// DeskCamera's lens.
export const SCULPT_MODULE_ID = "desk-group";

import { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const PALETTE = {
  deskWood: "#c9985f",
  deskWoodDark: "#a97a45",
  radioBody: "#e8792b",
  radioGrille: "#f2efe6",
  radioDial: "#254f9e",
  cameraBody: "#d5d5d2",
  cameraBodyDark: "#8f8f8c",
  cameraLens: "#1d1a17",
  cameraAccent: "#e8792b",
  screenBlue: "#2f6fd1",
  screenBlueDark: "#254f9e",
  keyboardBody: "#f6f5f0",
  potOrange: "#e07a2c",
  potBlue: "#1978d8",
  leafGreen: "#4a9b4a",
  leafGreenLight: "#5cb35c",
  lampWhite: "#f6f5f0",
  lampBrim: "#e8792b",
  lampTip: "#e8792b",
  pencilCupBlue: "#2f6fd1",
  pencilWood: "#e8792b",
  glassClear: "#e7e9ea",
  coffee: "#3b2418",
  rugBase: "#c9985f",
  rugTrim: "#1978d8",
  ringOrange: "#e07a2c",
  ringPink: "#e9a9c2",
  ringTeal: "#5fb3c9",
};

function Matte({ color, roughness = 0.5 }: { color: string; roughness?: number }) {
  return <meshPhysicalMaterial color={color} roughness={roughness} metalness={0} clearcoat={0.4} clearcoatRoughness={0.25} />;
}

function Glossy({ color, roughness = 0.2 }: { color: string; roughness?: number }) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={roughness}
      metalness={0}
      clearcoat={0.85}
      clearcoatRoughness={0.1}
      envMapIntensity={1.3}
    />
  );
}

/* --------------------------------- Desk --------------------------------- */

function DeskTable({ topY = 1.08 }: { topY?: number }) {
  const radiusX = 1.55;
  const radiusZ = 1.0;
  const legInset = 0.82;
  const legPositions: [number, number][] = [
    [-radiusX * legInset, -radiusZ * legInset],
    [radiusX * legInset, -radiusZ * legInset],
    [-radiusX * legInset, radiusZ * legInset],
    [radiusX * legInset, radiusZ * legInset],
  ];
  return (
    <group name="desk-table">
      <mesh position={[0, topY, 0]} scale={[radiusX, 1, radiusZ]}>
        <cylinderGeometry args={[1, 1, 0.12, 40]} />
        <Glossy color={PALETTE.deskWood} roughness={0.35} />
      </mesh>
      <mesh position={[0, topY - 0.065, 0]} scale={[radiusX * 0.985, 1, radiusZ * 0.985]}>
        <cylinderGeometry args={[1, 1, 0.02, 40]} />
        <Matte color={PALETTE.deskWoodDark} roughness={0.5} />
      </mesh>
      {legPositions.map(([x, z], i) => (
        <mesh key={i} position={[x, topY / 2 - 0.06, z]}>
          <cylinderGeometry args={[0.09, 0.1, topY - 0.12, 16]} />
          <Glossy color={PALETTE.deskWood} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------ Screen ---------------------------------- */

function ScreenMonitor() {
  return (
    <group name="desk-screen">
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.22, 0.26, 0.05, 24]} />
        <Glossy color={PALETTE.screenBlueDark} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 0.38, 12]} />
        <Glossy color={PALETTE.screenBlueDark} />
      </mesh>
      <RoundedBox args={[0.86, 0.58, 0.06]} radius={0.05} smoothness={4} position={[0, 0.72, 0]}>
        <Glossy color={PALETTE.screenBlue} roughness={0.18} />
      </RoundedBox>
      <RoundedBox args={[0.74, 0.46, 0.02]} radius={0.03} smoothness={3} position={[0, 0.72, 0.035]}>
        <meshPhysicalMaterial color={PALETTE.screenBlueDark} roughness={0.15} clearcoat={0.6} envMapIntensity={1.4} />
      </RoundedBox>
    </group>
  );
}

function Keyboard() {
  return (
    <RoundedBox args={[0.62, 0.03, 0.22]} radius={0.02} smoothness={3} name="desk-keyboard">
      <Matte color={PALETTE.keyboardBody} roughness={0.55} />
    </RoundedBox>
  );
}

function Mouse() {
  return (
    <mesh scale={[1, 0.55, 1.4]} name="desk-mouse">
      <sphereGeometry args={[0.06, 16, 16]} />
      <Matte color={PALETTE.keyboardBody} roughness={0.4} />
    </mesh>
  );
}

/* -------------------------------- Camera ---------------------------------- */

function DeskCamera() {
  return (
    <group name="desk-camera" rotation={[0, 0.5, 0]}>
      <RoundedBox args={[0.42, 0.26, 0.2]} radius={0.05} smoothness={4}>
        <Matte color={PALETTE.cameraBody} roughness={0.35} />
      </RoundedBox>
      <mesh position={[0, 0.06, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.16, 20]} />
        <meshPhysicalMaterial color={PALETTE.cameraLens} roughness={0.25} clearcoat={0.7} />
      </mesh>
      <mesh position={[0, 0.06, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.1, 0.02, 10, 20]} />
        <Matte color={PALETTE.cameraAccent} roughness={0.3} />
      </mesh>
      {[-0.13, 0.13].map((x) => (
        <RoundedBox key={x} args={[0.07, 0.04, 0.03]} radius={0.01} smoothness={2} position={[x, 0.15, 0.11]}>
          <Matte color={PALETTE.cameraBodyDark} roughness={0.3} />
        </RoundedBox>
      ))}
    </group>
  );
}

/* --------------------------------- Radio ------------------------------------ */

function DeskRadio() {
  return (
    <group name="desk-radio">
      <RoundedBox args={[0.34, 0.28, 0.24]} radius={0.05} smoothness={4}>
        <Matte color={PALETTE.radioBody} roughness={0.4} />
      </RoundedBox>
      {[0.06, 0.0, -0.06].map((y, i) => (
        <RoundedBox key={i} args={[0.24, 0.03, 0.01]} radius={0.01} smoothness={2} position={[0, y, 0.125]}>
          <Matte color={PALETTE.radioGrille} roughness={0.5} />
        </RoundedBox>
      ))}
      <mesh position={[-0.1, 0.17, 0.11]}>
        <cylinderGeometry args={[0.018, 0.018, 0.02, 12]} />
        <Matte color={PALETTE.radioDial} roughness={0.3} />
      </mesh>
      <mesh position={[0.1, 0.17, 0.11]}>
        <cylinderGeometry args={[0.018, 0.018, 0.02, 12]} />
        <Matte color={PALETTE.radioDial} roughness={0.3} />
      </mesh>
      <mesh position={[-0.13, 0.32, -0.05]} rotation={[0, 0, 0.25]}>
        <cylinderGeometry args={[0.01, 0.014, 0.32, 8]} />
        <Matte color={PALETTE.cameraBodyDark} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ------------------------------ Cup / Lamp / Coffee ------------------------ */

function PencilCup() {
  return (
    <group name="desk-pencil-cup">
      <mesh>
        <cylinderGeometry args={[0.075, 0.065, 0.14, 20]} />
        <Matte color={PALETTE.pencilCupBlue} roughness={0.35} />
      </mesh>
      <mesh position={[0.02, 0.13, -0.01]} rotation={[0, 0, -0.25]}>
        <cylinderGeometry args={[0.012, 0.012, 0.2, 8]} />
        <Matte color={PALETTE.pencilWood} roughness={0.45} />
      </mesh>
    </group>
  );
}

function CapLamp() {
  return (
    <group name="desk-cap-lamp" position={[-0.02, 0.06, 0.02]}>
      <mesh position={[0, 0.34, 0]} rotation={[0, 0, 0.06]}>
        <cylinderGeometry args={[0.012, 0.014, 0.68, 8]} />
        <Matte color={PALETTE.cameraBodyDark} roughness={0.35} />
      </mesh>
      <group position={[0.03, 0.66, 0]} rotation={[0, 0, -0.18]}>
        <mesh position={[0, 0.05, -0.02]} scale={[1, 0.82, 1.1]}>
          <sphereGeometry args={[0.16, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
          <Glossy color={PALETTE.lampWhite} roughness={0.25} />
        </mesh>
        <mesh position={[0, -0.015, 0.09]} rotation={[Math.PI / 2.35, 0, 0]}>
          <cylinderGeometry args={[0.155, 0.155, 0.02, 24, 1, false, 0, Math.PI]} />
          <Glossy color={PALETTE.lampBrim} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.19, -0.02]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <Matte color={PALETTE.lampTip} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

function CoffeeGlass() {
  return (
    <group name="desk-coffee-glass">
      <mesh>
        <cylinderGeometry args={[0.075, 0.065, 0.16, 20]} />
        <meshPhysicalMaterial color={PALETTE.glassClear} roughness={0.1} transmission={0.55} thickness={0.05} clearcoat={0.8} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.068, 0.068, 0.08, 20]} />
        <meshPhysicalMaterial color={PALETTE.coffee} roughness={0.25} clearcoat={0.6} />
      </mesh>
    </group>
  );
}

/* --------------------------------- Plant ------------------------------------ */

function PotPlant() {
  const leaves = useMemo(
    () => [
      { pos: [0.02, 0.52, 0.03] as [number, number, number], rot: [0.3, 0.4, 0.1] as [number, number, number], scale: 1 },
      { pos: [-0.1, 0.46, -0.05] as [number, number, number], rot: [0.5, -0.6, -0.2] as [number, number, number], scale: 0.85 },
      { pos: [0.11, 0.44, -0.06] as [number, number, number], rot: [0.4, 1.1, 0.15] as [number, number, number], scale: 0.9 },
      { pos: [-0.03, 0.6, -0.02] as [number, number, number], rot: [0.15, 2.2, 0] as [number, number, number], scale: 1.05 },
      { pos: [0.0, 0.4, 0.1] as [number, number, number], rot: [0.7, 2.8, 0.1] as [number, number, number], scale: 0.8 },
    ],
    []
  );
  return (
    <group name="desk-plant">
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.16, 0.14, 0.2, 20]} />
        <Matte color={PALETTE.potOrange} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.19, 0]}>
        <cylinderGeometry args={[0.165, 0.165, 0.03, 20]} />
        <Matte color={PALETTE.potBlue} roughness={0.4} />
      </mesh>
      {leaves.map((leaf, i) => (
        <mesh key={i} position={leaf.pos} rotation={leaf.rot} scale={[0.16 * leaf.scale, 0.24 * leaf.scale, 0.1 * leaf.scale]}>
          <sphereGeometry args={[1, 14, 14]} />
          <Matte color={i % 2 === 0 ? PALETTE.leafGreen : PALETTE.leafGreenLight} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------------------------- Rug ------------------------------------- */

function RugRing({ radius, color, y }: { radius: number; color: string; y: number }) {
  return (
    <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[Math.max(radius - 0.16, 0.02), radius, 48]} />
      <meshStandardMaterial color={color} roughness={0.6} />
    </mesh>
  );
}

function RugModel() {
  return (
    <group name="desk-rug">
      <RoundedBox args={[4.6, 0.03, 3.6]} radius={0.45} smoothness={4} position={[0, 0.005, 0.3]}>
        <Matte color={PALETTE.rugTrim} roughness={0.7} />
      </RoundedBox>
      <RoundedBox args={[4.4, 0.02, 3.4]} radius={0.4} smoothness={4} position={[0, 0.014, 0.3]}>
        <Matte color={PALETTE.rugBase} roughness={0.75} />
      </RoundedBox>
      <RugRing radius={1.15} color={PALETTE.rugTrim} y={0.025} />
      <RugRing radius={0.95} color={PALETTE.ringOrange} y={0.026} />
      <RugRing radius={0.72} color={PALETTE.ringTeal} y={0.027} />
      <RugRing radius={0.5} color={PALETTE.ringPink} y={0.028} />
      <RugRing radius={0.28} color={PALETTE.rugTrim} y={0.029} />
    </group>
  );
}

/* ------------------------------ Composed group ------------------------------ */

export function DeskGroupModel(props: { scale?: number }) {
  const scale = props.scale ?? 1;
  const topY = 1.08;

  return (
    <group scale={scale} name={SCULPT_MODULE_ID}>
      <RugModel />
      <DeskTable topY={topY} />

      <group position={[0, topY + 0.06, 0.05]}>
        <ScreenMonitor />
      </group>
      <group position={[0, topY + 0.015, 0.42]}>
        <Keyboard />
      </group>
      <group position={[0.38, topY + 0.015, 0.4]}>
        <Mouse />
      </group>

      <group position={[-1.15, topY + 0.06, 0.28]}>
        <DeskRadio />
      </group>
      <group position={[-0.78, topY + 0.06, 0.5]}>
        <DeskCamera />
      </group>

      <group position={[0.92, topY + 0.06, 0.35]}>
        <PencilCup />
        <CapLamp />
      </group>
      <group position={[1.14, topY + 0.06, 0.5]}>
        <CoffeeGlass />
      </group>
      <group position={[1.55, topY, 0.15]}>
        <PotPlant />
      </group>
    </group>
  );
}
