// @ts-nocheck - R3F primitive element types require runtime JSX augmentation
import { forwardRef, useEffect, useImperativeHandle, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Particles as ParticlesCore } from "../particles.js";
import type { ParticlesConfig } from "../types.js";

export interface ParticlesProps {
  config: ParticlesConfig;
  autoStart?: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export const Particles = forwardRef<ParticlesCore, ParticlesProps>(function Particles(
  { config, autoStart = true, ...props },
  ref,
) {
  const particles = useMemo(() => new ParticlesCore(config), [config]);

  useImperativeHandle(ref, () => particles, [particles]);

  useEffect(() => {
    if (autoStart) particles.start();
    return () => particles.dispose();
  }, [particles, autoStart]);

  useFrame((_, delta) => particles.update(delta));

  return <primitive object={particles} {...props} />;
});

Particles.displayName = "Particles";
