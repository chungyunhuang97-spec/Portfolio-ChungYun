"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { SculptGeneratedCharacterBlockout } from "@/components/three/SculptGeneratedCharacterBlockout";

// Isolated check page: mounts ONLY the sculptor-tool-generated blockout-pass
// factory (real THREE.js code emitted by `sculpt module build`), so its
// runtime-capture hook (window.__THREEJS_SCULPT_CAPTURE_RUNTIME__) exists on
// a real page for genuine evidence capture. Not part of the portfolio site -
// a throwaway verification route for the sculptor-plugin exercise.
export default function PilotSculptCheckPage() {
  return (
    <div className="h-dvh w-full bg-[#cfcabf]">
      <Canvas shadows camera={{ position: [2.5, 3.4, 3.2], fov: 35 }}>
        <color attach="background" args={["#cfcabf"]} />
        <directionalLight position={[-3, 4, 2]} intensity={2.2} castShadow />
        <ambientLight intensity={0.5} />
        <Environment preset="apartment" environmentIntensity={0.6} />
        <SculptGeneratedCharacterBlockout scale={1.4} />
        <OrbitControls target={[0, 1.95, 0]} />
      </Canvas>
    </div>
  );
}
