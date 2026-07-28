"use client";

// Orb lamp on the shelf pedestal (ref: generated lava-lamp close-up). A
// glossy white dome resting in a glossy blue bowl base, split at ~62% height
// to match the reference's two-tone seam line.
export const SCULPT_MODULE_ID = "lava-lamp";

function Glossy({ color, roughness = 0.15 }: { color: string; roughness?: number }) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={roughness}
      metalness={0}
      clearcoat={1}
      clearcoatRoughness={0.08}
      envMapIntensity={1.3}
    />
  );
}

export function LavaLampModel(props: { scale?: number }) {
  const scale = props.scale ?? 1;
  const radius = 0.6;
  // seam sits at ~62% up from the bottom pole -> thetaStart measured from top
  const seamTheta = Math.PI * 0.62;

  return (
    <group scale={scale} name={SCULPT_MODULE_ID}>
      {/* white dome — top portion, slightly overlapping past the seam so no gap shows */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[radius, 48, 32, 0, Math.PI * 2, 0, seamTheta + 0.03]} />
        <Glossy color="#f2f1ec" roughness={0.12} />
      </mesh>
      {/* blue base — bottom bowl portion */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry
          args={[radius, 48, 32, 0, Math.PI * 2, seamTheta, Math.PI - seamTheta]}
        />
        <Glossy color="#3f6fc9" roughness={0.18} />
      </mesh>
    </group>
  );
}
