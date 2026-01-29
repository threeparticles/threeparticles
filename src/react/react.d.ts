import { ForwardRefExoticComponent, RefAttributes } from "react";
import { Particles as ParticlesCore, ParticlesConfig } from "@threeparticles/core";

export interface ParticlesProps {
  config: ParticlesConfig;
  autoStart?: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export declare const Particles: ForwardRefExoticComponent<
  ParticlesProps & RefAttributes<ParticlesCore>
>;
