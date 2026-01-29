import type * as THREE from "three/webgpu";

/**
 * Color stop definition for gradient textures.
 */
export interface ColorStop {
  /** CSS color string (hex, rgb, named color, etc.) */
  color: string;
  /** Position in gradient from 0 to 1 */
  stop: number;
}

/** Available easing function identifiers. */
export type EaseFunction =
  | "easeLinear"
  | "easeInPower1"
  | "easeOutPower1"
  | "easeInOutPower1"
  | "easeInPower2"
  | "easeOutPower2"
  | "easeInOutPower2"
  | "easeInPower3"
  | "easeOutPower3"
  | "easeInOutPower3"
  | "easeInPower4"
  | "easeOutPower4"
  | "easeInOutPower4"
  | "easeInQuad"
  | "easeOutQuad"
  | "easeInOutQuad"
  | "easeInCubic"
  | "easeOutCubic"
  | "easeInOutCubic"
  | "easeInQuart"
  | "easeOutQuart"
  | "easeInOutQuart"
  | "easeInQuint"
  | "easeOutQuint"
  | "easeInOutQuint"
  | "easeInSine"
  | "easeOutSine"
  | "easeInOutSine"
  | "easeInExpo"
  | "easeOutExpo"
  | "easeInOutExpo"
  | "easeInCirc"
  | "easeOutCirc"
  | "easeInOutCirc"
  | "easeInElastic"
  | "easeOutElastic"
  | "easeInOutElastic"
  | "easeInBack"
  | "easeOutBack"
  | "easeInOutBack";

/** All easing function names, ordered by shader ID. */
export const EASE_FUNCTIONS: EaseFunction[] = [
  "easeLinear",
  "easeInPower1",
  "easeOutPower1",
  "easeInOutPower1",
  "easeInPower2",
  "easeOutPower2",
  "easeInOutPower2",
  "easeInPower3",
  "easeOutPower3",
  "easeInOutPower3",
  "easeInPower4",
  "easeOutPower4",
  "easeInOutPower4",
  "easeInQuad",
  "easeOutQuad",
  "easeInOutQuad",
  "easeInCubic",
  "easeOutCubic",
  "easeInOutCubic",
  "easeInQuart",
  "easeOutQuart",
  "easeInOutQuart",
  "easeInQuint",
  "easeOutQuint",
  "easeInOutQuint",
  "easeInSine",
  "easeOutSine",
  "easeInOutSine",
  "easeInExpo",
  "easeOutExpo",
  "easeInOutExpo",
  "easeInCirc",
  "easeOutCirc",
  "easeInOutCirc",
  "easeInElastic",
  "easeOutElastic",
  "easeInOutElastic",
  "easeInBack",
  "easeOutBack",
  "easeInOutBack",
];

/**
 * Particle shape rendering modes.
 */
export enum AppearanceMode {
  /** Square/quad particles */
  Square = 0,
  /** Circular particles with soft edges */
  Circular = 1,
}

/**
 * Configuration for particle visual appearance and behavior.
 */
export interface ParticleSettings {
  /** Maximum number of particles in the system */
  count: number;
  /** Color intensity multiplier (1.0 = normal) */
  intensity: number;
  /** Size fade range [start, end] as progress values (0-1) */
  fadeSize: [min: number, max: number];
  /** Alpha fade range [start, end] as progress values (0-1) */
  fadeAlpha: [min: number, max: number];
  /** Alpha map morph range [start, end] as progress values (0-1) */
  fadeAlphaMap: [min: number, max: number];
  /** World-space gravity force [x, y, z] */
  gravity: [x: number, y: number, z: number];
  /** Alpha map textures for particle start state */
  alphaMapsStart?: THREE.Texture[];
  /** Alpha map textures for particle end state */
  alphaMapsEnd?: THREE.Texture[];
  /** Color gradient definitions per row */
  colors: ColorStop[][];
  /** Particle shape mode */
  appearance: AppearanceMode;
  /** Easing function for particle animation */
  easeFunction: EaseFunction;
}

/**
 * Configuration for WebGPU rendering settings.
 */
export interface RenderSettings {
  /** Size of each alpha map slot in the texture atlas (pixels) */
  alphaMapSize: number;
  /** Texture filtering mode for alpha maps */
  alphaMapFilter: THREE.MagnificationTextureFilter;
  /** Enable frustum culling for the particle mesh */
  frustumCulled: boolean;
  /** Blending mode for particle rendering */
  blendingMode: THREE.Blending;
  /** Which side of faces to render */
  side: THREE.Side;
  /** Enable depth testing */
  depthTest: boolean;
}

/**
 * Configuration for particle emission behavior.
 */
export interface EmitterSettings {
  /** Total duration of emission in seconds */
  duration: number;
  /** Number of particles to emit per cycle */
  rate: number;
  /** Emission timing mode: "time" spreads over duration, "burst" emits all at once */
  spawnMode: "time" | "burst";
  /** Static position blend (0 = dynamic, 1 = static at spawn position) */
  static: number;
  /** Apply world up-right correction during animation */
  worldUpRight: boolean;
  /** Loop the emission continuously */
  loop: boolean;
  /** Delay before first emission in seconds */
  delay: number;
  /** Show debug wireframe mesh at emitter position */
  debug: boolean;
  /** Particle lifetime range [min, max] in seconds */
  lifetime: [min: number, max: number];
  /** Speed range [min, max] in units per second */
  speed: [min: number, max: number];
  /** Size range [min, max] */
  size: [min: number, max: number];
  /** Minimum spawn position offset [x, y, z] */
  startPositionMin: [x: number, y: number, z: number];
  /** Maximum spawn position offset [x, y, z] */
  startPositionMax: [x: number, y: number, z: number];
  /** Minimum initial rotation [x, y, z] normalized -1 to 1 */
  startRotationMin: [x: number, y: number, z: number];
  /** Maximum initial rotation [x, y, z] normalized -1 to 1 */
  startRotationMax: [x: number, y: number, z: number];
  /** Minimum rotation speed [x, y, z] in radians per second */
  rotationSpeedMin: [x: number, y: number, z: number];
  /** Maximum rotation speed [x, y, z] in radians per second */
  rotationSpeedMax: [x: number, y: number, z: number];
  /** Minimum emission direction [x, y, z] */
  directionMin: [x: number, y: number, z: number];
  /** Maximum emission direction [x, y, z] */
  directionMax: [x: number, y: number, z: number];
}

/**
 * Complete particle system configuration.
 */
export interface ParticlesConfig {
  /** Visual appearance settings */
  particles: ParticleSettings;
  /** WebGPU rendering settings */
  render: RenderSettings;
  /** Emission behavior settings */
  emitter: EmitterSettings;
}

/**
 * Particle settings with texture paths instead of Texture objects.
 * Used in JSON exports from the editor.
 */
export type ExportParticleSettings = Omit<ParticleSettings, "alphaMapsStart" | "alphaMapsEnd"> & {
  alphaMapsStart?: string[];
  alphaMapsEnd?: string[];
};

/**
 * Single emitter configuration as exported from the editor.
 */
export interface ExportEmitterConfig {
  id: string;
  particles: ExportParticleSettings;
  render: RenderSettings;
  emitter: EmitterSettings;
  position?: [x: number, y: number, z: number];
}

/**
 * Project containing multiple emitter configurations.
 */
export interface ExportProject {
  id: string;
  configs: ExportEmitterConfig[];
}
