"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { RoomShellModel } from "@/components/three/RoomShellModel";
import { CameraToyModel } from "@/components/three/CameraToyModel";

// Pilot preview for the room "shell" (architecture only: walls, floor, trim,
// doorway, alcove, wall plaques). The camera-toy module is dropped into the
// alcove just to sanity-check that furnishings will read correctly at scale
// once composed into this coordinate frame — it is not final placement.
export default function PilotRoomShellPage() {
  return (
    <div className="h-dvh w-full bg-[#cfcabf]">
      <Canvas shadows camera={{ position: [7, 5, 9], fov: 35 }}>
        <color attach="background" args={["#cfcabf"]} />
        <directionalLight
          position={[-6, 8, 4]}
          intensity={2.4}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <ambientLight intensity={0.45} />
        <Environment preset="apartment" environmentIntensity={0.5} />

        <RoomShellModel />

        <group position={[2.6, 4.3, -1.1]} rotation={[0, -Math.PI / 8, 0]}>
          <CameraToyModel scale={0.6} />
        </group>

        <OrbitControls target={[0, 3, -1]} enablePan minDistance={4} maxDistance={20} />
      </Canvas>
    </div>
  );
}
