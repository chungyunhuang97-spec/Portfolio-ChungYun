"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows, OrbitControls } from "@react-three/drei";
import { InflatedBlobModel } from "@/components/three/InflatedBlobModel";

// Pilot preview for the "inflated balloon" decorative blob shapes Joe
// referenced. Three variants side by side to show the range the metaball
// technique can cover — not wired into the real hero yet.
export default function PilotBlobsPage() {
  return (
    <div className="h-dvh w-full bg-[#e9e4da]">
      <Canvas camera={{ position: [0, 1.2, 7.5], fov: 35 }}>
        <color attach="background" args={["#e9e4da"]} />
        <directionalLight position={[-3, 4, 2]} intensity={2.2} />
        <ambientLight intensity={0.4} />
        <Environment preset="city" environmentIntensity={0.7} />

        <group position={[-2.6, 0, 0]}>
          <InflatedBlobModel color="#3a7d3a" arms={4} taper={0.5} scale={1} />
        </group>
        <group position={[0, 0, 0]}>
          <InflatedBlobModel color="#d9506b" arms={6} taper={0.4} scale={1} />
        </group>
        <group position={[2.6, 0, 0]}>
          <InflatedBlobModel color="#3f5fd9" arms={5} taper={0.35} scale={1} />
        </group>

        <ContactShadows position={[0, -1.1, 0]} opacity={0.4} scale={10} blur={2.2} far={2} />
        <OrbitControls enablePan={false} minDistance={3} maxDistance={12} />
      </Canvas>
    </div>
  );
}
