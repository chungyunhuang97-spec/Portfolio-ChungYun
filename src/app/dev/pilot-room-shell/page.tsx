"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { RoomShellModel } from "@/components/three/RoomShellModel";
import { CameraToyModel } from "@/components/three/CameraToyModel";
import { CharacterModel } from "@/components/three/CharacterModel";

// Pilot preview for the room "shell" (architecture only: walls, floor, trim,
// doorway, alcove, wall plaques). The camera-toy module is dropped into the
// alcove and the seated character is dropped near room-center just to
// sanity-check that furnishings will read correctly at scale once composed
// into this coordinate frame — neither placement is final.
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
        <directionalLight
          position={[5, 3, 6]}
          intensity={0.9}
          color="#eaf6ff"
        />
        <Environment preset="apartment" environmentIntensity={0.65} />

        <RoomShellModel />

        <group position={[2.6, 4.3, -1.1]} rotation={[0, -Math.PI / 8, 0]}>
          <CameraToyModel scale={0.6} />
        </group>

        {/* No rotation here — CharacterModel is built with its front
            (face, chest circuit panel, knees, toes) facing local +Z, which
            already points roughly toward this camera's position. */}
        <group position={[0, 0, 0.3]}>
          <CharacterModel scale={1.1} />
        </group>

        <OrbitControls target={[0, 3, -1]} enablePan minDistance={4} maxDistance={20} />
      </Canvas>
    </div>
  );
}
