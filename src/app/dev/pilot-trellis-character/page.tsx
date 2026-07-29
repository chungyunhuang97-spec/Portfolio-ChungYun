"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { RoomShellModel } from "@/components/three/RoomShellModel";
import { CharacterModel } from "@/components/three/CharacterModel";
import { TrellisCharacterModel } from "@/components/three/TrellisCharacterModel";

// Pipeline test page: places the TRELLIS.2 image-to-3D character (left)
// next to the hand-built CharacterModel (right) inside the same room shell
// and lighting rig used on pilot-room-shell, so scale / material response /
// shading can be compared like-for-like before deciding whether to swap
// the hero over. Not the real hero composition, a comparison rig only.
export default function PilotTrellisCharacterPage() {
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

        <group position={[1.3, 0, 0.3]}>
          <CharacterModel scale={1.1} />
        </group>

        <group position={[-1.3, 0, 0.3]}>
          <TrellisCharacterModel targetHeight={1.75} />
        </group>

        <OrbitControls target={[0, 2.5, -1]} enablePan minDistance={4} maxDistance={20} />
      </Canvas>
    </div>
  );
}
