"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows, OrbitControls } from "@react-three/drei";
import { CameraToyModel } from "@/components/three/CameraToyModel";

// Pilot preview route — not linked from the site nav. Visits this route to
// visually QA the procedural camera model against public/hero/refs/5.cam.png
// before deciding whether to convert the rest of the hero scene.
export default function PilotCameraPage() {
  return (
    <div className="h-dvh w-full bg-[#e9e4da]">
      <Canvas
        shadows
        camera={{ position: [1.6, 1.1, 2.6], fov: 32 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#e9e4da"]} />
        {/* single key light, upper-left, matching the established scene lighting */}
        <directionalLight
          position={[-3, 4, 2]}
          intensity={2.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <ambientLight intensity={0.35} />
        <Environment preset="city" environmentIntensity={0.6} />

        <CameraToyModel scale={1.3} />

        <ContactShadows position={[0, -0.85, 0]} opacity={0.45} scale={6} blur={2.2} far={2} />
        <OrbitControls enablePan={false} minDistance={2} maxDistance={6} />
      </Canvas>
    </div>
  );
}
