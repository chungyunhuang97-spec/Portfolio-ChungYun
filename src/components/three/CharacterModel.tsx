"use client";

// Seated character at the desk (ref: character reference set — a smooth
// porcelain-white mannequin body in an oversized hoodie with a glowing blue
// circuit pattern showing through the translucent fabric, wide sweatpants,
// chunky canvas sneakers). This module bundles a simple scoop chair with the
// figure since no separate desk/chair module exists yet in the build order
// — the chair here is a placeholder seat only, not the final desk furniture
// pass ("桌面小物" comes after this module). Chair fabric uses the room's
// existing warm cream palette so it reads as environment furniture, while
// the figure itself keeps the distinct cool "digital" hoodie material from
// the reference art. Built as a self-contained group (like the camera toy
// and beanbag chair) so it can be scale-checked before final placement.
export const SCULPT_MODULE_ID = "character-seated-desk";

import { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const PALETTE = {
  skin: "#f4f2ee",
  fabricLight: "#f1efe9", // sweatpants
  fabricShadow: "#dcd7cb",
  sneaker: "#f6f5f0",
  hoodieShell: "#dbe8f1",
  hoodieTrim: "#eef3f6",
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

// Translucent hoodie shell — a frosted, semi-see-through fabric so the
// circuit panel underneath reads as "glowing through" rather than printed
// on top.
function HoodieShell({ opacityBoost = 0 }: { opacityBoost?: number }) {
  return (
    <meshPhysicalMaterial
      color={PALETTE.hoodieShell}
      roughness={0.22}
      metalness={0}
      transmission={Math.max(0.6 - opacityBoost, 0.1)}
      thickness={0.6}
      ior={1.4}
      clearcoat={0.4}
      clearcoatRoughness={0.15}
      envMapIntensity={1.1}
      transparent
      opacity={0.96}
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
    const cy = size * 0.42;
    const chip = size * 0.15;
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

    const traceCount = 16;
    for (let i = 0; i < traceCount; i++) {
      const angle = (i / traceCount) * Math.PI * 2;
      const startR = chip / 2 + 4;
      let x = cx + Math.cos(angle) * startR;
      let y = cy + Math.sin(angle) * startR;
      const segs = 2 + Math.floor(rand() * 2);
      for (let s = 0; s < segs; s++) {
        const horizontal = rand() > 0.5;
        const len = 28 + rand() * 65;
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
      const y = size * 0.08 + i * (size * 0.02);
      drawGlowLine(size * 0.08, y, size * 0.32, y, 1.3);
    }
    for (let i = 0; i < 5; i++) {
      const y = size * 0.78 + i * (size * 0.02);
      drawGlowLine(size * 0.64, y, size * 0.92, y, 1.3);
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
      new THREE.Vector3(side * 0.1, 1.78, 0.34),
      new THREE.Vector3(side * 0.14, 1.55, 0.4),
      new THREE.Vector3(side * 0.1, 1.3, 0.42),
      new THREE.Vector3(side * 0.06, 1.08, 0.4),
    ];
    return new THREE.CatmullRomCurve3(points);
  }, [side]);
  return (
    <mesh>
      <tubeGeometry args={[curve, 20, 0.018, 8, false]} />
      <Matte color={PALETTE.drawstring} roughness={0.4} />
    </mesh>
  );
}

function DeskChair() {
  const backProfile = useMemo(() => {
    const pts: [number, number][] = [
      [0.02, 0.0],
      [0.4, 0.03],
      [0.58, 0.16],
      [0.55, 0.5],
      [0.52, 0.95],
      [0.47, 1.35],
      [0.4, 1.6],
      [0.28, 1.68],
    ];
    const spline = new THREE.SplineCurve(pts.map(([r, y]) => new THREE.Vector2(r, y)));
    const points = spline.getPoints(48);
    // Partial revolve leaves a front-facing gap so the shell cups the
    // sitter's back and sides without a wall in front of their legs.
    return new THREE.LatheGeometry(points, 48, Math.PI * 0.18, Math.PI * 1.64);
  }, []);

  return (
    <group position={[0, 0, -0.12]} name="desk-chair">
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
      <mesh geometry={backProfile} position={[0, 0.82, 0]} rotation={[0, Math.PI, 0]}>
        <Matte color={PALETTE.chairFabric} roughness={0.6} />
      </mesh>
      {/* seat cushion pad */}
      <RoundedBox args={[0.86, 0.12, 0.82]} radius={0.08} smoothness={4} position={[0, 0.94, 0.18]}>
        <Matte color={PALETTE.chairFabricShadow} roughness={0.65} />
      </RoundedBox>
    </group>
  );
}

function Laptop() {
  return (
    <group position={[0, 1.06, 0.66]} rotation={[0, 0, 0]}>
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
    <group position={[-0.62, 0.98, 0.35]}>
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

function Head() {
  return (
    <group position={[0, 2.28, 0.02]}>
      {/* neck */}
      <mesh position={[0, -0.28, 0]}>
        <cylinderGeometry args={[0.11, 0.13, 0.18, 16]} />
        <Porcelain />
      </mesh>
      {/* cranium, slightly squashed front-to-back and narrowed toward the jaw */}
      <mesh scale={[0.95, 1.05, 0.92]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <Porcelain />
      </mesh>
      {/* jaw taper */}
      <mesh position={[0, -0.2, 0.02]} scale={[0.78, 0.62, 0.78]}>
        <sphereGeometry args={[0.3, 24, 24]} />
        <Porcelain />
      </mesh>
      {/* brow ridge lines */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.11, 0.03, 0.275]} rotation={[0, 0, s * 0.12]}>
          <boxGeometry args={[0.12, 0.018, 0.02]} />
          <Matte color="#c9c5bc" roughness={0.5} />
        </mesh>
      ))}
      {/* nose */}
      <mesh position={[0, -0.06, 0.3]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.035, 0.09, 12]} />
        <Porcelain />
      </mesh>
      {/* mouth line */}
      <mesh position={[0, -0.17, 0.29]}>
        <boxGeometry args={[0.09, 0.012, 0.01]} />
        <Matte color="#c9c5bc" roughness={0.5} />
      </mesh>
      {/* hairline groove, center-parted */}
      <mesh position={[0, 0.29, -0.02]}>
        <boxGeometry args={[0.012, 0.02, 0.22]} />
        <Matte color="#dedad0" roughness={0.5} />
      </mesh>
    </group>
  );
}

export function CharacterModel(props: { scale?: number }) {
  const scale = props.scale ?? 1;
  const circuitTexture = useCircuitTexture();

  const hipY = 1.05;
  const shoulderY = 1.82;

  return (
    <group scale={scale} name={SCULPT_MODULE_ID}>
      <DeskChair />

      {/* legs — thighs run forward from the hip, shins drop to the floor */}
      <Limb start={[0.17, hipY, -0.05]} end={[0.17, hipY - 0.05, 0.72]} radius={0.15} color={PALETTE.fabricLight} />
      <Limb start={[-0.17, hipY, -0.05]} end={[-0.17, hipY - 0.05, 0.72]} radius={0.15} color={PALETTE.fabricLight} />
      <Limb start={[0.17, hipY - 0.05, 0.72]} end={[0.19, 0.12, 0.55]} radius={0.13} color={PALETTE.fabricLight} />
      <Limb start={[-0.17, hipY - 0.05, 0.72]} end={[-0.19, 0.12, 0.55]} radius={0.13} color={PALETTE.fabricLight} />

      {/* sneakers */}
      {[0.19, -0.19].map((x) => (
        <RoundedBox
          key={x}
          args={[0.22, 0.14, 0.36]}
          radius={0.06}
          smoothness={4}
          position={[x, 0.07, 0.66]}
        >
          <Matte color={PALETTE.sneaker} roughness={0.6} />
        </RoundedBox>
      ))}

      {/* torso — rounded hoodie body via lathe, seated so it sits slightly
          forward-leaning over the lap */}
      <group position={[0, hipY, 0]}>
        <mesh
          geometry={useMemo(() => {
            const pts: [number, number][] = [
              [0.0, -0.02],
              [0.34, 0.0],
              [0.48, 0.18],
              [0.5, 0.42],
              [0.46, 0.62],
              [0.36, 0.76],
              [0.22, 0.8],
              [0.0, 0.82],
            ];
            const spline = new THREE.SplineCurve(pts.map(([r, y]) => new THREE.Vector2(r, y)));
            return new THREE.LatheGeometry(spline.getPoints(40), 40);
          }, [])}
        >
          <HoodieShell />
        </mesh>

        {/* circuit panel showing through the chest — curved partial cylinder
            wrapping the front of the torso */}
        <mesh position={[0, 0.42, 0]} rotation={[0, Math.PI, 0]}>
          <cylinderGeometry args={[0.47, 0.47, 0.62, 24, 1, true, Math.PI * 0.62, Math.PI * 0.76]} />
          <meshBasicMaterial map={circuitTexture} transparent toneMapped={false} side={THREE.DoubleSide} />
        </mesh>

        {/* kangaroo pocket — more opaque than the glowing chest zone */}
        <RoundedBox args={[0.42, 0.22, 0.08]} radius={0.05} smoothness={4} position={[0, 0.14, 0.44]}>
          <HoodieShell opacityBoost={0.35} />
        </RoundedBox>

        {/* zipper */}
        <mesh position={[0, 0.42, 0.49]}>
          <boxGeometry args={[0.02, 0.78, 0.015]} />
          <meshPhysicalMaterial color={PALETTE.zipper} roughness={0.3} metalness={0.4} />
        </mesh>

        {/* hood collar behind the neck */}
        <mesh position={[0, 0.8, -0.06]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.19, 0.075, 12, 24, Math.PI * 1.3]} />
          <HoodieShell opacityBoost={0.2} />
        </mesh>

        <DrawstringCord side={1} />
        <DrawstringCord side={-1} />
      </group>

      {/* arms — bent forward at the elbow toward the laptop keyboard */}
      <Limb start={[0.46, shoulderY, 0.05]} end={[0.4, 1.4, 0.5]} radius={0.11} color={PALETTE.hoodieShell} roughness={0.3} />
      <Limb start={[-0.46, shoulderY, 0.05]} end={[-0.4, 1.4, 0.5]} radius={0.11} color={PALETTE.hoodieShell} roughness={0.3} />
      <Limb start={[0.4, 1.4, 0.5]} end={[0.16, 1.08, 0.72]} radius={0.095} color={PALETTE.hoodieShell} roughness={0.3} />
      <Limb start={[-0.4, 1.4, 0.5]} end={[-0.16, 1.08, 0.72]} radius={0.095} color={PALETTE.hoodieShell} roughness={0.3} />

      {/* hands resting on the keyboard */}
      {[0.16, -0.16].map((x) => (
        <mesh key={x} position={[x, 1.06, 0.78]} scale={[1, 0.6, 1.3]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <Porcelain />
        </mesh>
      ))}

      <Laptop />
      <Mug />
      <Head />
    </group>
  );
}
