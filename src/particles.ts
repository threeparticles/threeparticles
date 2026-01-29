// @ts-nocheck - TSL types are incompatible with TypeScript
import * as THREE from "three/webgpu";
import { texture, uniform, instancedArray } from "three/tsl";
import type { ParticlesConfig } from "./types";
import { EASE_FUNCTIONS } from "./types";
import { createTextureAtlas, createColorGradientTexture } from "./textures";
import { mat } from "./nodes";
import { randFloat, randInt } from "./utils";

/**
 * WebGPU accelerated particle system using Three.js TSL shaders.
 *
 * @example
 * ```ts
 * const particles = new Particles({
 *   particles: { count: 1000, colors: [[{ color: "#ff0000", stop: 0 }]] },
 *   render: { blendingMode: THREE.AdditiveBlending },
 *   emitter: { duration: 2, speed: [5, 10] }
 * });
 * scene.add(particles);
 * particles.start();
 * ```
 */
export class Particles extends THREE.Object3D {
  private mesh: THREE.InstancedMesh;
  /** Base object for positioning the emitter */
  public base: THREE.Object3D;
  private debugMesh: THREE.Mesh;
  private material: THREE.NodeMaterial;
  private config: ParticlesConfig;

  private uniforms: {
    cursor: THREE.UniformNode<number>;
    rate: THREE.UniformNode<number>;
    uTime: THREE.UniformNode<number>;
    uPosition: THREE.UniformNode<THREE.Vector3>;
    alphaMap: THREE.UniformNode<THREE.Texture>;
    uColorGradient: THREE.UniformNode<THREE.Texture>;
  };

  private buffers: {
    instanceLifetime: Float32Array;
    instance: Float32Array;
    instanceDirection: Float32Array;
    instanceRotationSpeed: Float32Array;
    instanceAlphaMapUVOffset: Float32Array;
    instanceSpeed: Float32Array;
  };

  private attributes: {
    instanceLifetime: THREE.StorageBufferNode;
    instance: THREE.StorageBufferNode;
    instanceDirection: THREE.StorageBufferNode;
    instanceRotationSpeed: THREE.StorageBufferNode;
    instanceAlphaMapUVOffset: THREE.StorageBufferNode;
    instanceSpeed: THREE.StorageBufferNode;
  };

  private easingIndex: number = 0;
  private alphaMapCount = 0;
  private emitted = 0;
  private cursor = 0;
  /** Whether the particle system is currently running */
  public running = false;

  /**
   * Creates a new particle system.
   *
   * @param config - Particle system configuration
   * @param geometry - Optional custom geometry (defaults to PlaneGeometry)
   */
  constructor(config: ParticlesConfig, geometry?: THREE.BufferGeometry) {
    super();

    this.name = "Particles";
    this.type = "Particles";

    this.base = new THREE.Object3D();
    this.base.name = "Base";
    this.add(this.base);

    // Debug Mesh
    this.debugMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, 0.2),
      new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true }),
    );
    this.debugMesh.name = "Debug";
    this.base.add(this.debugMesh);

    this.config = {
      particles: {
        count: config.particles.count ?? 1000,
        intensity: config.particles.intensity ?? 1,
        fadeSize: config.particles.fadeSize ?? [0.1, 0.9],
        fadeAlpha: config.particles.fadeAlpha ?? [0.0, 1.0],
        fadeAlphaMap: config.particles.fadeAlphaMap ?? [0.0, 1.0],
        gravity: config.particles.gravity ?? [0, 0, 0],
        alphaMapsStart: config.particles.alphaMapsStart ?? [],
        alphaMapsEnd: config.particles.alphaMapsEnd ?? [],
        colors: config.particles.colors ?? [[{ color: "#ffffff", stop: 0 }]],
        appearance: config.particles.appearance ?? 0,
        easeFunction: config.particles.easeFunction ?? "easeLinear",
      },
      render: {
        alphaMapSize: config.render.alphaMapSize ?? 256,
        alphaMapFilter: config.render.alphaMapFilter ?? THREE.LinearFilter,
        frustumCulled: config.render.frustumCulled ?? true,
        blendingMode: config.render.blendingMode ?? THREE.AdditiveBlending,
        side: config.render.side ?? THREE.FrontSide,
        depthTest: config.render.depthTest ?? true,
      },
      emitter: {
        duration: config.emitter.duration ?? 1,
        rate: config.emitter.rate ?? 1000,
        spawnMode: config.emitter.spawnMode ?? "time",
        static: config.emitter.static ?? 0.0,
        worldUpRight: config.emitter.worldUpRight ?? false,
        loop: config.emitter.loop ?? false,
        delay: config.emitter.delay ?? 0,
        debug: config.emitter.debug ?? false,
        lifetime: config.emitter.lifetime ?? [0.1, 1],
        speed: config.emitter.speed ?? [5, 20],
        size: config.emitter.size ?? [0.1, 1],
        startPositionMin: config.emitter.startPositionMin ?? [0, 0, 0],
        startPositionMax: config.emitter.startPositionMax ?? [0, 0, 0],
        startRotationMin: config.emitter.startRotationMin ?? [0, 0, 0],
        startRotationMax: config.emitter.startRotationMax ?? [0, 0, 0],
        rotationSpeedMin: config.emitter.rotationSpeedMin ?? [0, 0, 0],
        rotationSpeedMax: config.emitter.rotationSpeedMax ?? [0, 0, 0],
        directionMin: config.emitter.directionMin ?? [0, 0, 0],
        directionMax: config.emitter.directionMax ?? [0, 0, 0],
      },
    };

    this.debugMesh.visible = this.config.emitter.debug;

    this.easingIndex = EASE_FUNCTIONS.indexOf(this.config.particles.easeFunction);

    const alphaMaps = [
      ...this.config.particles.alphaMapsStart!,
      ...this.config.particles.alphaMapsEnd!,
    ];

    this.alphaMapCount = alphaMaps.length;

    let atlas = null;
    if (alphaMaps.length > 0) {
      atlas = createTextureAtlas(
        alphaMaps,
        undefined,
        this.config.render.alphaMapSize,
        this.config.render.alphaMapFilter,
      );
    } else {
      const canvas = document.createElement("canvas");
      atlas = new THREE.CanvasTexture(canvas);
    }

    const colorGradientTexture = createColorGradientTexture(this.config.particles.colors, 128);

    this.uniforms = {
      cursor: uniform(0),
      rate: uniform(0),
      uTime: uniform(0),
      uPosition: uniform(this.base.position),
      alphaMap: texture(atlas),
      uColorGradient: texture(colorGradientTexture),
    };

    const defaultGeometry = geometry ?? new THREE.PlaneGeometry(0.5, 0.5);
    const count = this.config.particles.count;

    this.buffers = {
      instanceLifetime: new Float32Array(count * 2),
      instance: new Float32Array(count * 7),
      instanceDirection: new Float32Array(count * 3),
      instanceRotationSpeed: new Float32Array(count * 3),
      instanceAlphaMapUVOffset: new Float32Array(count * 2),
      instanceSpeed: new Float32Array(count),
    };

    this.attributes = {
      instanceLifetime: instancedArray(this.buffers.instanceLifetime, "float"),
      instance: instancedArray(this.buffers.instance, "float"),
      instanceDirection: instancedArray(this.buffers.instanceDirection, "float"),
      instanceRotationSpeed: instancedArray(this.buffers.instanceRotationSpeed, "float"),
      instanceAlphaMapUVOffset: instancedArray(this.buffers.instanceAlphaMapUVOffset, "float"),
      instanceSpeed: instancedArray(this.buffers.instanceSpeed, "float"),
    };

    this.material = this.createMaterial();

    this.mesh = new THREE.InstancedMesh(defaultGeometry, this.material, count);

    this.mesh.userData = {
      attributes: this.attributes,
      uniforms: this.uniforms,
      config: this.config,
      alphaMapCount: this.alphaMapCount,
      easingIndex: this.easingIndex,
    };

    this.add(this.mesh);

    this.mesh.frustumCulled = this.config.render.frustumCulled ?? false;
  }

  /**
   * Creates and configures the particle material from the shared template.
   *
   * @returns Configured node material for particle rendering
   */
  private createMaterial(): THREE.NodeMaterial {
    const _mat = mat.clone();
    _mat.blending = this.config.render.blendingMode!;
    _mat.premultipliedAlpha =
      this.config.render.blendingMode === THREE.SubtractiveBlending ||
      this.config.render.blendingMode === THREE.MultiplyBlending;
    _mat.depthWrite = false;
    _mat.side = this.config.render.side!;
    _mat.depthTest = this.config.render.depthTest!;
    _mat.transparent = true;
    return _mat;
  }

  /** Starts the particle system from the beginning. */
  public start(): void {
    this.running = true;
    this.uniforms.uTime.value = 0;
    this.cursor = 0;
    this.emitted = 0;
    this.visible = true;
    this.mesh.visible = true;
    this.attributes.instanceLifetime.value.array.fill(0);
  }

  /** Pauses the particle system, keeping current state. */
  public pause(): void {
    this.running = false;
  }

  /** Stops the particle system and hides it. */
  public stop(): void {
    this.running = false;
    this.visible = false;
    this.mesh.visible = false;
  }

  /**
   * Updates the particle system. Call this each frame.
   *
   * @param delta - Time elapsed since last frame in seconds
   */
  public update(delta: number): void {
    this.mesh.visible = this.visible;
    if (!this.running) return;
    this._update();
    this.uniforms.uTime.value += delta;
  }

  /**
   * Computes initial values for a single particle instance.
   * Populates position, rotation, direction, lifetime, and speed buffers.
   *
   * @param i - Particle index in the instance buffers
   */
  private _compute(i: number): void {
    const { emitter, particles } = this.config;
    const pos = this.uniforms.uPosition.value;
    const dynamicFactor = 1 - emitter.static;

    // Instance data: position (3) + rotation (3) + scale (1) = 7 floats
    const inst = this.attributes.instance.value.array;
    const i7 = i * 7;
    inst[i7 + 0] =
      randFloat(emitter.startPositionMin[0], emitter.startPositionMax[0]) + pos.x * dynamicFactor;
    inst[i7 + 1] =
      randFloat(emitter.startPositionMin[1], emitter.startPositionMax[1]) + pos.y * dynamicFactor;
    inst[i7 + 2] =
      randFloat(emitter.startPositionMin[2], emitter.startPositionMax[2]) + pos.z * dynamicFactor;
    inst[i7 + 3] = randFloat(emitter.startRotationMin[0], emitter.startRotationMax[0]);
    inst[i7 + 4] = randFloat(emitter.startRotationMin[1], emitter.startRotationMax[1]);
    inst[i7 + 5] = randFloat(emitter.startRotationMin[2], emitter.startRotationMax[2]);
    inst[i7 + 6] = randFloat(emitter.size[0], emitter.size[1]);

    // Direction and rotation speed: 3 floats each
    const i3 = i * 3;
    const dir = this.attributes.instanceDirection.value.array;
    dir[i3 + 0] = randFloat(emitter.directionMin[0], emitter.directionMax[0]);
    dir[i3 + 1] = randFloat(emitter.directionMin[1], emitter.directionMax[1]);
    dir[i3 + 2] = randFloat(emitter.directionMin[2], emitter.directionMax[2]);

    const rotSpeed = this.attributes.instanceRotationSpeed.value.array;
    rotSpeed[i3 + 0] = randFloat(emitter.rotationSpeedMin[0], emitter.rotationSpeedMax[0]);
    rotSpeed[i3 + 1] = randFloat(emitter.rotationSpeedMin[1], emitter.rotationSpeedMax[1]);
    rotSpeed[i3 + 2] = randFloat(emitter.rotationSpeedMin[2], emitter.rotationSpeedMax[2]);

    // Lifetime and alpha map offsets: 2 floats each
    const i2 = i * 2;
    const lifetime = this.attributes.instanceLifetime.value.array;
    lifetime[i2 + 0] = this.uniforms.uTime.value;
    lifetime[i2 + 1] = randFloat(emitter.lifetime[0], emitter.lifetime[1]);

    const startCount = particles.alphaMapsStart?.length ?? 0;
    const endCount = particles.alphaMapsEnd?.length ?? 0;
    const startIdx = startCount > 0 ? randInt(0, startCount - 1) : 0;
    let endIdx = 0;
    if (endCount > 0) {
      endIdx = startCount + randInt(0, endCount - 1);
    } else if (startCount > 0) {
      endIdx = randInt(0, startCount - 1);
    }
    const alphaOffset = this.attributes.instanceAlphaMapUVOffset.value.array;
    alphaOffset[i2 + 0] = startIdx;
    alphaOffset[i2 + 1] = endIdx;

    // Speed: 1 float
    this.attributes.instanceSpeed.value.array[i] = randFloat(emitter.speed[0], emitter.speed[1]);
  }

  /**
   * Internal update loop that spawns new particles based on emission settings.
   * Calculates spawn rate and initializes particle data for newly emitted particles.
   */
  private _update(): void {
    const loop = this.config.emitter.loop;
    const spawnMode = this.config.emitter.spawnMode;
    const maxParticlesTotal = this.config.particles.count;
    const maxParticles = this.config.emitter.rate;
    const duration = this.config.emitter.duration;
    const delay = this.config.emitter.delay;

    const amount =
      spawnMode === "burst"
        ? maxParticles
        : Math.max(0, Math.floor(((this.uniforms.uTime.value - delay) / duration) * maxParticles));

    const rate = amount - this.emitted;

    if (this.emitted >= maxParticles && !loop) return;

    if (spawnMode === "time") {
      if (this.cursor >= maxParticlesTotal) this.cursor = 0;
      this.uniforms.cursor.value = this.cursor;
      this.uniforms.rate.value = rate;
    }

    for (let _i = this.cursor; _i < this.cursor + rate; _i++) this._compute(_i);

    this.attributes.instance.value.needsUpdate = true;
    this.attributes.instanceDirection.value.needsUpdate = true;
    this.attributes.instanceRotationSpeed.value.needsUpdate = true;
    this.attributes.instanceLifetime.value.needsUpdate = true;
    this.attributes.instanceAlphaMapUVOffset.value.needsUpdate = true;
    this.attributes.instanceSpeed.value.needsUpdate = true;

    if (spawnMode === "time") {
      this.cursor += rate;
      this.cursor = this.cursor % maxParticlesTotal;
    }

    this.emitted += rate;
  }

  /**
   * Updates the configuration at runtime.
   *
   * @param config - Partial configuration to merge
   */
  public updateConfig(config: Partial<ParticlesConfig>): void {
    if (config.particles) Object.assign(this.config.particles, config.particles);
    if (config.render) Object.assign(this.config.render, config.render);
    if (config.emitter) Object.assign(this.config.emitter, config.emitter);
  }

  /** Disposes of all resources used by the particle system. */
  public dispose(): void {
    this.stop();
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
