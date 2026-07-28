"use client";

// Seated character at the desk (ref: character reference set — a smooth
// porcelain-white mannequin body in an oversized, BOXY cropped hoodie with a
// glowing blue circuit pattern showing through the translucent fabric, very
// wide straight-leg sweatpants, chunky canvas sneakers).
//
// Rev 2 notes (after first-pass review): the torso was rebuilt from a
// rounded lathe profile (read as a vase/bottle) to a boxy RoundedBox
// (matches the oversized dropped-shoulder hoodie silhouette). The hood was
// rebuilt from a thin partial-torus arc (read as two ear flaps from behind)
// to a single wide, low, flattened pad that sits on the shoulders. The
// front-facing convention is now consistent throughout: face, chest panel,
// knees and toes all point toward local +Z, with no compensating rotations
// buried in individual parts — composition-level rotation (in the preview
// page) controls which way the whole figure faces.
//
// This module bundles a simple scoop chair with the figure since no
// separate desk/chair module exists yet ("桌面小物" comes after this pass)
// — the chair is a placeholder seat only. Chair fabric uses the room's
// existing warm cream palette so it reads as environment furniture, while
// the figure itself keeps the distinct cool "digital" hoodie material from
// the reference.
export const SCULPT_MODULE_ID = "character-seated-desk";

import { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const PALETTE = {
  skin: "#f4f2ee",
  fabricLight: "#f1efe9", // sweatpants
  sneaker: "#f6f5f0",
  hoodieShell: "#dbe8f1",
  drawstring: "#f2efe6",
  zipper: "#b9bcc0",
  chairFabric: "#e7e1d3",
  chairFabricShadow: "#d3ccbb",
  pedestal: "#9a948a",
  laptopBody: "#d8d8d6",
  laptopScreen: "#14171c",
  mugBody: "#efece4",
  coffee: "#3b2418",
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
      roughness={0.26}
      metalness={0}
      transmission={dense ? 0.12 : 0.35}
      thickness={0.5}
      ior={1.35}
      clearcoat={0.5}
      clearcoatRoughness={0.18}
      envMapIntensity={0.9}
      transparent
      opacity={dense ? 0.98 : 0.94}
    />
  );
}

// Procedural circuit-board texture: a central "chip" square plus right-angle
// traces radiating outward with small pads at each bend, glowing blue on a
// transparent ground. Baked once with a seeded PRNG so the board is stable
// across re-renders.
function useCircuitTexture() {
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
    const cy = size * 0.4;
    const chip = size * 0.16;
    ctx.shadowColor = "rgba(90,180,255,0.9)";
    ctx.shadowBlur = 26;
    ctx.fillStyle = "rgba(140,210,255,0.85)";
    ctx.fillRect(cx - chip / 2, cy - chip / 2, chip, chip);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#eaf6ff";
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - chip / 2, cy - chip / 2, chip, chip);

    let seed = 7;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    const traceCount = 18;
    for (let i = 0; i < traceCount; i++) {
      const angle = (i / traceCount) * Math.PI * 2;
      const startR = chip / 2 + 4;
      let x = cx + Math.cos(angle) * startR;
      let y = cy + Math.sin(angle) * startR;
      const segs = 2 + Math.floor(rand() * 2);
      for (let s = 0; s < segs; s++) {
        const horizontal = rand() > 0.5;
        const len = 26 + rand() * 60;
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

    for (let i = 0; i < 5; i++) {
      const y = size * 0.06 + i * (size * 0.02);
      drawGlowLine(size * 0.06, y, size * 0.34, y, 1.3);
    }
    for (let i = 0; i < 5; i++) {
      const y = size * 0.82 + i * (size * 0.02);
      drawGlowLine(size * 0.62, y, size * 0.94, y, 1.3);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
}

// A capsule "bone" drawn between two points — reused for thighs, shins,
// upper arms and forearms so limbs can be posed by moving joint points
// rather than hand-rotating each mesh.
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
  const a = new THREE.Vector3(...start);
  const b = new THREE.Vector3(...end);
  const dir = new THREE.Vector3().subVectors(b, a);
  const length = dir.length();
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.clone().normalize()
  );
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
      new THREE.Vector3(side * 0.08, 1.86, 0.28),
      new THREE.Vector3(side * 0.12, 1.66, 0.32),
      new THREE.Vector3(side * 0.09, 1.44, 0.34),
      new THREE.Vector3(side * 0.05, 1.26, 0.32),
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
    // Partial revolve leaves a front-facing gap (centered on +Z) so the
    // shell cups the sitter's back and sides without a wall in front of
    // their legs. Lathe phi=0 -> +X, phi=PI/2 -> +Z, so the gap (the part
    // NOT generated) should straddle PI/2; we generate the remaining ~310°.
    return new THREE.LatheGeometry(points, 48, Math.PI * 0.79, Math.PI * 1.72);
  }, []);

  return (
    <group position={[0, 0, -0.15]} name="desk-chair">
      {/* pedestal */}
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.09, 0.13, 0.84, 20]} />
        <meshPhysicalMaterial color={PALETTE.pedestal} roughness={0.35} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.34, 0.36, 0.06, 28]} />
        <meshPhysicalMaterial color={PALETTE.pedestal} roughness={0.4} metalness={0.35} />
      </mesh>
      {/* scoop seat + back shell */}
      <mesh geometry={backProfile} position={[0, 0.82, 0]}>
        <Matte color={PALETTE.chairFabric} roughness={0.6} />
      </mesh>
      {/* seat cushion pad */}
      <RoundedBox args={[0.9, 0.12, 0.84]} radius={0.08} smoothness={4} position={[0, 0.94, 0.2]}>
        <Matte color={PALETTE.chairFabricShadow} roughness={0.65} />
      </RoundedBox>
    </group>
  );
}

function Laptop() {
  return (
    <group position={[0, 1.28, 0.56]}>
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
    <group position={[-0.72, 1.05, 0.3]}>
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

// Head sits at the given world Y (top of neck). Short thick neck, head
// close to the collar — matches the reference's low head-to-shoulder gap.
function Head({ y }: { y: number }) {
  return (
    <group position={[0, y, 0.01]}>
      {/* neck — short and thick */}
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.13, 0.15, 0.14, 16]} />
        <Porcelain />
      </mesh>
      {/* cranium */}
      <mesh position={[0, 0.36, 0]} scale={[0.95, 1.05, 0.92]}>
        <sphereGeometry args={[0.29, 32, 32]} />
        <Porcelain />
      </mesh>
      {/* jaw taper */}
      <mesh position={[0, 0.19, 0.02]} scale={[0.78, 0.6, 0.78]}>
        <sphereGeometry args={[0.29, 24, 24]} />
        <Porcelain />
      </mesh>
      {/* brow ridge lines */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.1, 0.42, 0.265]} rotation={[0, 0, s * 0.12]}>
          <boxGeometry args={[0.11, 0.017, 0.02]} />
          <Matte color="#c9c5bc" roughness={0.5} />
        </mesh>
      ))}
      {/* nose */}
      <mesh position={[0, 0.33, 0.29]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.033, 0.085, 12]} />
        <Porcelain />
      </mesh>
      {/* mouth line */}
      <mesh position={[0, 0.22, 0.28]}>
        <boxGeometry args={[0.085, 0.011, 0.01]} />
        <Matte color="#c9c5bc" roughness={0.5} />
      </mesh>
      {/* hairline groove, center-parted */}
      <mesh position={[0, 0.64, -0.01]}>
        <boxGeometry args={[0.011, 0.02, 0.2]} />
        <Matte color="#dedad0" roughness={0.5} />
      </mesh>
    </group>
  );
}

export function CharacterModel(props: { scale?: number }) {
  const scale = props.scale ?? 1;
  const circuitTexture = useCircuitTexture();

  const hipY = 1.0;
  // Torso box half-extents (width/height/depth), all measured from the
  // group pivot at hip height.
  const torsoHalfW = 0.53;
  const torsoHalfH = 0.44;
  const torsoHalfD = 0.26;
  const torsoCenterY = 0.46; // local, relative to hipY
  const shoulderY = hipY + torsoCenterY + torsoHalfH - 0.06; // near top of box

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

      {/* torso — boxy oversized hoodie body */}
      <group position={[0, hipY, 0]}>
        <RoundedBox
          args={[torsoHalfW * 2, torsoHalfH * 2, torsoHalfD * 2]}
          radius={0.19}
          smoothness={4}
          position={[0, torsoCenterY, 0]}
        >
          <HoodieShell />
        </RoundedBox>

        {/* circuit panel showing through the chest — curved partial
            cylinder wrapping the front of the torso, arc centered on +Z
            (theta=PI/2) so it faces forward with no extra rotation. */}
        <mesh position={[0, torsoCenterY + 0.05, 0]}>
          <cylinderGeometry
            args={[torsoHalfD + 0.015, torsoHalfD + 0.015, 0.6, 24, 1, true, Math.PI * 0.12, Math.PI * 0.76]}
          />
          <meshBasicMaterial map={circuitTexture} transparent toneMapped={false} side={THREE.DoubleSide} />
        </mesh>

        {/* kangaroo pocket — more opaque than the glowing chest zone */}
        <RoundedBox
          args={[0.48, 0.22, 0.06]}
          radius={0.05}
          smoothness={4}
          position={[0, torsoCenterY - 0.3, torsoHalfD + 0.02]}
        >
          <HoodieShell dense />
        </RoundedBox>

        {/* zipper */}
        <mesh position={[0, torsoCenterY, torsoHalfD + 0.01]}>
          <boxGeometry args={[0.02, torsoHalfH * 2 - 0.05, 0.015]} />
          <meshPhysicalMaterial color={PALETTE.zipper} roughness={0.3} metalness={0.4} />
        </mesh>

        {/* hood — wide, low, flattened pad resting on the shoulders/back
            of the neck (not a thin arc, so it doesn't read as ears from
            behind). Tilted so the far edge dips down toward the back. */}
        <RoundedBox
          args={[0.62, 0.16, 0.34]}
          radius={0.09}
          smoothness={4}
          position={[0, torsoHalfH * 2 + torsoCenterY - 0.04, -0.12]}
          rotation={[-0.2, 0, 0]}
        >
          <HoodieShell dense />
        </RoundedBox>

        <DrawstringCord side={1} />
        <DrawstringCord side={-1} />
      </group>

      {/* arms — loose sleeves bent forward at the elbow toward the laptop
          keyboard, tapering slightly toward a fitted cuff */}
      <Limb start={[torsoHalfW + 0.05, shoulderY, 0.02]} end={[0.46, hipY + 0.32, 0.42]} radius={0.16} color={PALETTE.hoodieShell} roughness={0.3} />
      <Limb start={[-torsoHalfW - 0.05, shoulderY, 0.02]} end={[-0.46, hipY + 0.32, 0.42]} radius={0.16} color={PALETTE.hoodieShell} roughness={0.3} />
      <Limb start={[0.46, hipY + 0.32, 0.42]} end={[0.2, hipY + 0.24, 0.56]} radius={0.12} color={PALETTE.hoodieShell} roughness={0.3} />
      <Limb start={[-0.46, hipY + 0.32, 0.42]} end={[-0.2, hipY + 0.24, 0.56]} radius={0.12} color={PALETTE.hoodieShell} roughness={0.3} />

      {/* cuff rings at the wrist */}
      {[0.2, -0.2].map((x) => (
        <mesh key={x} position={[x, hipY + 0.24, 0.56]} rotation={[0.35, 0, 0]}>
          <torusGeometry args={[0.1, 0.022, 10, 18]} />
          <HoodieShell dense />
        </mesh>
      ))}

      {/* hands resting on the keyboard */}
      {[0.18, -0.18].map((x) => (
        <mesh key={x} position={[x, hipY + 0.24, 0.62]} scale={[1, 0.6, 1.3]}>
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
