"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows, OrbitControls } from "@react-three/drei";
import { LavaLampModel } from "@/components/three/LavaLampModel";
import { ShelfUnitModel } from "@/components/three/ShelfUnitModel";
import { BeanbagChairModel } from "@/components/three/BeanbagChairModel";

// Pilot preview for the three furnishing modules built from Joe's generated
// close-up references: orb lamp, empty shelf unit, beanbag chair.
export default function PilotFurnishings1Page() {
  return (
    <div className="h-dvh w-full bg-[#e9e4da]">
      <Canvas shadows camera={{ position: [0, 2.2, 9], fov: 35 }}>
        <color attach="background" args={["#e9e4da"]} />
        <directionalLight position={[-4, 6, 3]} intensity={2.2} castShadow />
        <ambientLight intensity={0.4} />
        <Environment preset="city" environmentIntensity={0.6} />

        <group position={[-3.2, 1.7, 0]}>
          <LavaLampModel scale={1.1} />
        </group>

        <group position={[0, 0, 0]}>
          <ShelfUnitModel scale={1} />
        </group>

        <group position={[3.4, 0, 0]}>
          <BeanbagChairModel color="#2f6fc0" scale={1.1} />
        </group>

        <ContactShadows position={[0, -0.02, 0]} opacity={0.4} scale={12} blur={2.2} far={3} />
        <OrbitControls enablePan target={[0, 1.4, 0]} minDistance={3} maxDistance={16} />
      </Canvas>
    </div>
  );
}
