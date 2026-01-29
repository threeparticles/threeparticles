import * as THREE from "three/webgpu";
import { Canvas } from "@react-three/fiber";
import { Particles } from "@threeparticles/core/react";
import type { ParticlesConfig } from "@threeparticles/core";

const config: ParticlesConfig = {
  particles: {
    count: 10000,
    intensity: 2,
    colors: [
      [
        { color: "cyan", stop: 0 },
        { color: "purple", stop: 1 },
      ],
    ],
  },
  render: {
    blendingMode: THREE.AdditiveBlending,
  },
  emitter: {
    loop: true,
    rate: 1000,
    lifetime: [2, 4],
    speed: [0.5, 1],
    size: [0.05, 0.4],
    startPositionMin: [-0.2, -0.2, -0.2],
    startPositionMax: [0.2, 0.2, 0.2],
    directionMin: [-1, -1, -1],
    directionMax: [1, 1, 1],
  },
} as ParticlesConfig;

export function App() {
  return (
    <Canvas
      gl={async (props: any) => {
        const renderer = new THREE.WebGPURenderer({ ...props, antialias: true });
        await renderer.init();
        return renderer;
      }}
      camera={{ position: [0, 0, 5], fov: 75 }}
    >
      <Particles config={config} />
    </Canvas>
  );
}
