"use client";

// Seated character at the desk. Rev 3 — rebuilt against a proper 3-view
// turnaround sheet (front / side / back) generated from the approved
// reference art, so proportions below are traced from real orthographic
// views instead of guessed from a single 3/4 photo.
//
// Key corrections from the turnaround:
//  - Head is proportionally larger (~1/6.8 of standing height) than a
//    realistic figure — toy/collectible proportions, not human ones.
//  - Short, dark, side-swept hair (a rounded "cap" over the crown), not
//    bald, and not a buzzcut.
//  - Face is flat 2D-decal style: short dash eyes + dash eyebrows + a small
//    dash nose + a dash mouth. No sculpted 3D nose.
//  - Ears are visible small bumps.
//  - Hoodie is cropped MUCH shorter than the first two passes — it ends
//    right at/just above the waistband, exposing the sweatpants' drawstring
//    waistband underneath.
//  - Hood is a big rounded volume (a dome + a tilted collar ring), not a
//    thin flat pad — the back view shows a substantial rounded shape with a
//    center seam, sitting high behind the neck.
//  - Sleeves are balloon-puffy through the arm and cinch to a distinct
//    ribbed cuff at the wrist. The circuit-board glow is not chest-only —
//    it bleeds down onto the upper sleeves too.
//
// This module still bundles a placeholder scoop desk chair since no
// separate chair/desk module exists yet ("桌面小物" comes after this pass).
export const SCULPT_MODULE_ID = "character-seated-desk";

import { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const PALETTE = {
  skin: "#f4f2ee",
  hair: "#1d1a17",
  fabricLight: "#f1efe9", // sweatpants
  sneaker: "#f6f5f0",
  hoodieShell: "#cdeaf7",
  drawstring: "#f2efe6",
  zipper: "#c7cdd2",
  chairFabric: "#e7e1d3",
  chairFabricShadow: "#d3ccbb",
  pedestal: "#9a948a",
  laptopBody: "#d8d8d6",
  laptopScreen: "#14171c",
  mugBody: "#efece4",
  coffee: "#3b2418",
  decal: "#2b2925",
};

function Matte({ color, roughness = 0.55 }: { color: string; roughness?: number }) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={roughness}
      metalness={0}
      clearcoat={0.15}
      clearcoatRoughness={0.4}
    />
  );
}

function Porcelain({ color = PALETTE.skin, roughness = 0.42 }: { color?: string; roughness?: number }) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={roughness}
      metalness={0}
      clearcoat={0.35}
      clearcoatRoughness={0.25}
    />
  );
}

// Translucent hoodie shell — frosted, semi-see-through fabric so the
// circuit panel underneath reads as "glowing through" rather than printed
// on top. Transmission kept modest (not full glass) so it reads as thick
// coated fabric/PVC rather than a glass bottle.
function HoodieShell({ dense = false }: { dense?: boolean }) {
  return (
    <meshPhysicalMaterial
      color={PALETTE.hoodieShell}
      roughness={0.24}
      metalness={0}
      transmission={dense ? 0.12 : 0.35}
      thickness={0.5}
      ior={1.35}
      clearcoat={0.5}
      clearcoatRoughness={0.18}
      envMapIntensity={0.9}
      transparent
      opacity={dense ? 0.98 : 0.94}
      // Open partial-sphere/torus shapes (the hood dome, collar ring) show
      // their backface from some angles — without DoubleSide that backface
      // is invisible and renders through to whatever is behind it (a black
      // void), which is what made the hood read as a hollow black hole in
      // the first render of this pass.
      side={THREE.DoubleSide}
    />
  );
}

// Procedural circuit-board texture: a central "chip" square plus right-angle
// traces radiating outward with small pads at each bend, glowing blue on a
// transparent ground. Baked once with a seeded PRNG so the board is stable
// across re-renders. A second, sparser variant (fewer/shorter traces, no
// chip) is used for the sleeve bleed-over patches.
function useCircuitTexture(withChip: boolean, seed: number) {
  return useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new THREE.Texture();
    ctx.clearRect(0, 0, size, size);

    const drawGlowLine = (x1: number, y1: number, x2: number, y2: number, w: number) => {
      ctx.strokeStyle = "rgba(120,200,255,0.85)";
      ctx.lineWidth = w * 3;
      ctx.shadowColor = "rgba(90,180,255,0.9)";
      ctx.shadowBlur = w * 4;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#eaf6ff";
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };

    const cx = size / 2;
    const cy = withChip ? size * 0.4 : size * 0.5;

    let s = seed;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };

    if (withChip) {
      const chip = size * 0.16;
      ctx.shadowColor = "rgba(90,180,255,0.9)";
      ctx.shadowBlur = 26;
      ctx.fillStyle = "rgba(140,210,255,0.85)";
      ctx.fillRect(cx - chip / 2, cy - chip / 2, chip, chip);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#eaf6ff";
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - chip / 2, cy - chip / 2, chip, chip);
    }

    const traceCount = withChip ? 18 : 9;
    const startR = withChip ? size * 0.08 + 4 : 6;
    for (let i = 0; i < traceCount; i++) {
      const angle = (i / traceCount) * Math.PI * 2;
      let x = cx + Math.cos(angle) * startR;
      let y = cy + Math.sin(angle) * startR;
      const segs = 2 + Math.floor(rand() * 2);
      for (let sgi = 0; sgi < segs; sgi++) {
        const horizontal = rand() > 0.5;
        const len = (withChip ? 26 : 20) + rand() * (withChip ? 60 : 46);
        const nx = horizontal ? x + (rand() > 0.5 ? len : -len) : x;
        const ny = horizontal ? y : y + (rand() > 0.5 ? len : -len);
        drawGlowLine(x, y, nx, ny, 2 + rand() * 1.4);
        ctx.fillStyle = "rgba(160,220,255,0.9)";
        ctx.beginPath();
        ctx.arc(nx, ny, 3, 0, Math.PI * 2);
        ctx.fill();
        x = nx;
        y = ny;
      }
    }

    if (withChip) {
      for (let i = 0; i < 5; i++) {
        const y = size * 0.06 + i * (size * 0.02);
        drawGlowLine(size * 0.06, y, size * 0.34, y, 1.3);
      }
      for (let i = 0; i < 5; i++) {
        const y = size * 0.82 + i * (size * 0.02);
        drawGlowLine(size * 0.62, y, size * 0.94, y, 1.3);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [withChip, seed]);
}

// A capsule "bone" drawn between two points — reused for thighs, shins,
// upper arms and forearms so limbs can be posed by moving joint points
// rather than hand-rotating each mesh. Also returns its own transform so
// callers (like the sleeve circuit patch) can attach decals in the same
// local frame.
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

// Small curved circuit-glow patch on the outer face of the upper sleeve —
// the reference shows the chest circuit pattern bleeding down onto the
// arms, not stopping cleanly at the shoulder seam.
function SleeveCircuitPatch({
  start,
  end,
  radius,
  side,
  texture,
}: {
  start: [number, number, number];
  end: [number, number, number];
  radius: number;
  side: 1 | -1;
  texture: THREE.Texture;
}) {
  const { mid, quat } = segmentTransform(start, end);
  return (
    <group position={mid} quaternion={quat}>
      {/* offset + rotated so the patch sits on the outer-front face of the
          limb rather than wrapping it symmetrically */}
      <mesh rotation={[0, side * 0.9, 0]}>
        <cylinderGeometry args={[radius + 0.01, radius + 0.01, 0.42, 16, 1, true, Math.PI * 0.2, Math.PI * 0.7]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function DrawstringCord({ side }: { side: 1 | -1 }) {
  // Local to the hip-offset torso group: hangs from just below the hood
  // collar ring (~0.86) down to mid-chest (~0.46), hugging the front face
  // of the (now much shorter, cropped) torso box.
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
  const backProfile = useMemo(() => {
    const pts: [number, number][] = [
      [0.02, 0.0],
      [0.42, 0.03],
      [0.6, 0.16],
      [0.57, 0.5],
      [0.54, 0.95],
      [0.49, 1.35],
      [0.42, 1.6],
      [0.3, 1.68],
    ];
    const spline = new THREE.SplineCurve(pts.map(([r, y]) => new THREE.Vector2(r, y)));
    const points = spline.getPoints(48);
    return new THREE.LatheGeometry(points, 48, Math.PI * 0.79, Math.PI * 1.72);
  }, []);

  return (
    <group position={[0, 0, -0.15]} name="desk-chair">
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.09, 0.13, 0.84, 20]} />
        <meshPhysicalMaterial color={PALETTE.pedestal} roughness={0.35} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.34, 0.36, 0.06, 28]} />
        <meshPhysicalMaterial color={PALETTE.pedestal} roughness={0.4} metalness={0.35} />
      </mesh>
      <mesh geometry={backProfile} position={[0, 0.82, 0]}>
        <Matte color={PALETTE.chairFabric} roughness={0.6} />
      </mesh>
      <RoundedBox args={[0.9, 0.12, 0.84]} radius={0.08} smoothness={4} position={[0, 0.94, 0.2]}>
        <Matte color={PALETTE.chairFabricShadow} roughness={0.65} />
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

// Head sits at the given world Y (top of neck). Larger, toy-proportioned
// head; short dark side-swept hair cap; flat 2D-decal facial features
// (dash eyes/brows/nose/mouth) instead of sculpted features; visible ears.
function Head({ y }: { y: number }) {
  const headR = 0.32;
  return (
    <group position={[0, y, 0.01]}>
      {/* neck */}
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.13, 0.15, 0.16, 16]} />
        <Porcelain />
      </mesh>
      {/* cranium */}
      <mesh position={[0, 0.4, 0]} scale={[0.96, 1.04, 0.94]}>
        <sphereGeometry args={[headR, 32, 32]} />
        <Porcelain />
      </mesh>
      {/* jaw taper */}
      <mesh position={[0, 0.22, 0.02]} scale={[0.8, 0.6, 0.8]}>
        <sphereGeometry args={[headR, 24, 24]} />
        <Porcelain />
      </mesh>
      {/* ears */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (headR * 0.97), 0.36, 0.02]} scale={[0.35, 0.55, 0.22]}>
          <sphereGeometry args={[headR, 16, 16]} />
          <Porcelain />
        </mesh>
      ))}
      {/* hair — short side-swept cap over the crown, slightly asymmetric */}
      <mesh position={[0, 0.42, -0.01]} rotation={[0, 0, -0.06]} scale={[1.03, 1, 1.01]}>
        <sphereGeometry args={[headR * 1.05, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <Matte color={PALETTE.hair} roughness={0.42} />
      </mesh>
      {/* eyebrows */}
      {[-1, 1].map((s) => (
        <mesh key={"brow" + s} position={[s * 0.11, 0.47, headR * 0.9]} rotation={[0, 0, s * 0.05]}>
          <boxGeometry args={[0.1, 0.016, 0.015]} />
          <Matte color={PALETTE.decal} roughness={0.5} />
        </mesh>
      ))}
      {/* eyes — flat horizontal dashes */}
      {[-1, 1].map((s) => (
        <mesh key={"eye" + s} position={[s * 0.11, 0.4, headR * 0.94]}>
          <boxGeometry args={[0.08, 0.013, 0.012]} />
          <Matte color={PALETTE.decal} roughness={0.5} />
        </mesh>
      ))}
      {/* nose — small flat dash, not a sculpted 3D nose */}
      <mesh position={[0, 0.34, headR * 0.97]}>
        <boxGeometry args={[0.014, 0.05, 0.012]} />
        <Matte color={PALETTE.decal} roughness={0.5} />
      </mesh>
      {/* mouth */}
      <mesh position={[0, 0.29, headR * 0.95]}>
        <boxGeometry args={[0.075, 0.011, 0.01]} />
        <Matte color={PALETTE.decal} roughness={0.5} />
      </mesh>
    </group>
  );
}

export function CharacterModel(props: { scale?: number }) {
  const scale = props.scale ?? 1;
  const chestCircuit = useCircuitTexture(true, 7);
  const sleeveCircuit = useCircuitTexture(false, 23);

  const hipY = 1.0;
  // Torso box half-extents — cropped short, hem sits just above the
  // waistband (a thin sliver of waistband is visible below the hem).
  const torsoHalfW = 0.55;
  const torsoHalfH = 0.34;
  const torsoHalfD = 0.27;
  const torsoCenterY = 0.39; // local, relative to hipY
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

      {/* legs — thighs run forward from the hip, shins drop to the floor.
          Very wide, minimal taper to read as baggy sweatpants. */}
      <Limb start={[0.22, hipY, -0.02]} end={[0.24, hipY - 0.06, 0.66]} radius={0.18} color={PALETTE.fabricLight} />
      <Limb start={[-0.22, hipY, -0.02]} end={[-0.24, hipY - 0.06, 0.66]} radius={0.18} color={PALETTE.fabricLight} />
      <Limb start={[0.24, hipY - 0.06, 0.66]} end={[0.25, 0.12, 0.5]} radius={0.155} color={PALETTE.fabricLight} />
      <Limb start={[-0.24, hipY - 0.06, 0.66]} end={[-0.25, 0.12, 0.5]} radius={0.155} color={PALETTE.fabricLight} />

      {/* ankle cuffs */}
      {[0.25, -0.25].map((x) => (
        <mesh key={x} position={[x, 0.14, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.14, 0.03, 10, 20]} />
          <Matte color={PALETTE.fabricLight} roughness={0.6} />
        </mesh>
      ))}

      {/* sneakers */}
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

      {/* pants waistband — visible below the cropped hoodie hem */}
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

      {/* torso — boxy, cropped, oversized hoodie body */}
      <group position={[0, hipY, 0]}>
        <RoundedBox
          args={[torsoHalfW * 2, torsoHalfH * 2, torsoHalfD * 2]}
          radius={0.2}
          smoothness={4}
          position={[0, torsoCenterY, 0]}
        >
          <HoodieShell />
        </RoundedBox>

        {/* circuit panel showing through the chest — curved partial
            cylinder wrapping the front of the torso, arc centered on +Z
            (theta=PI/2) so it faces forward with no extra rotation. */}
        <mesh position={[0, torsoCenterY + 0.04, 0]}>
          <cylinderGeometry
            args={[torsoHalfD + 0.015, torsoHalfD + 0.015, 0.5, 24, 1, true, Math.PI * 0.12, Math.PI * 0.76]}
          />
          <meshBasicMaterial map={chestCircuit} transparent toneMapped={false} side={THREE.DoubleSide} />
        </mesh>

        {/* zipper */}
        <mesh position={[0, torsoCenterY, torsoHalfD + 0.01]}>
          <boxGeometry args={[0.02, torsoHalfH * 2 - 0.04, 0.015]} />
          <meshPhysicalMaterial color={PALETTE.zipper} roughness={0.3} metalness={0.4} />
        </mesh>

        {/* hood collar ring — tilted so the front dips toward the chest and
            the back rises up high behind the neck */}
        <mesh position={[0, torsoHalfH * 2 + torsoCenterY - 0.16, -0.02]} rotation={[0.55, 0, 0]}>
          <torusGeometry args={[0.26, 0.075, 12, 28]} />
          <HoodieShell dense />
        </mesh>

        {/* hood volume — big rounded dome sitting behind the neck/shoulders */}
        <mesh
          position={[0, torsoHalfH * 2 + torsoCenterY + 0.02, -0.22]}
          scale={[1, 0.85, 0.8]}
        >
          <sphereGeometry args={[0.34, 28, 28, 0, Math.PI * 2, 0, Math.PI * 0.66]} />
          <HoodieShell dense />
        </mesh>
        {/* center back seam on the hood */}
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

      {/* arms — puffy balloon sleeves bent forward at the elbow toward the
          laptop keyboard, cinched to a ribbed cuff at the wrist */}
      <Limb start={armShoulder(1)} end={armElbow(1)} radius={0.175} color={PALETTE.hoodieShell} roughness={0.3} />
      <Limb start={armShoulder(-1)} end={armElbow(-1)} radius={0.175} color={PALETTE.hoodieShell} roughness={0.3} />
      <Limb start={armElbow(1)} end={armWrist(1)} radius={0.115} color={PALETTE.hoodieShell} roughness={0.3} />
      <Limb start={armElbow(-1)} end={armWrist(-1)} radius={0.115} color={PALETTE.hoodieShell} roughness={0.3} />

      {/* circuit bleed-over patches on the outer upper sleeves */}
      <SleeveCircuitPatch start={armShoulder(1)} end={armElbow(1)} radius={0.175} side={1} texture={sleeveCircuit} />
      <SleeveCircuitPatch start={armShoulder(-1)} end={armElbow(-1)} radius={0.175} side={-1} texture={sleeveCircuit} />

      {/* ribbed cuff rings at the wrist */}
      {[armWrist(1), armWrist(-1)].map((p, i) => (
        <mesh key={i} position={p} rotation={[0.35, 0, 0]}>
          <torusGeometry args={[0.1, 0.024, 10, 18]} />
          <HoodieShell dense />
        </mesh>
      ))}

      {/* hands resting on the keyboard */}
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
