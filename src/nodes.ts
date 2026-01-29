/**
 * TSL shader nodes for WebGPU based particle computation.
 * These nodes handle position, rotation, scale, and color calculations on the GPU.
 * @module
 */
// @ts-nocheck - TSL types are incompatible with TypeScript
import * as THREE from "three/webgpu";
import {
  normalize,
  max,
  varying,
  If,
  distance,
  Discard,
  select,
  length,
  range,
  instanceIndex,
  vec3,
  float,
  mix,
  texture,
  vec4,
  Fn,
  vec2,
  smoothstep,
  uv,
  uint,
  modelWorldMatrix,
  transpose,
  mat3,
  bool,
} from "three/tsl";
import { applyEasing } from "./easing";

// Instance index multipliers for accessing packed buffer data
const idx7 = instanceIndex.mul(7);
const idx3 = instanceIndex.mul(3);
const idx2 = instanceIndex.mul(2);

/** Varying progress value shared between shader nodes */
const vProgress = varying(float(0), "vProgress");

/** TSL node for computing particle position based on time, velocity, and gravity. */
const positionNode = /*@__PURE__*/ Fn(
  ([pos, age, duration, vProgress, uGravity, dir, speed, worldUpRight, easingIndex]) => {
    const progress = age.div(duration);
    const _pos = vec3(pos);

    If(progress.lessThan(0.0).or(progress.greaterThan(1.0)), () => {
      vProgress.assign(1.0);
      _pos.assign(vec3(0, 9999, 0));
    }).Else(() => {
      vProgress.assign(applyEasing(progress, easingIndex));
      const normalizedDirection = select(length(dir).greaterThan(0), normalize(dir), vec3(0));
      const gravityForce = uGravity.mul(0.5).mul(age.mul(age));
      const easedAge = vProgress.mul(duration);
      const offset = normalizedDirection.mul(easedAge).mul(speed).add(gravityForce);

      If(worldUpRight, () => {
        const m = mat3(modelWorldMatrix);
        const rot = mat3(normalize(m[0]), normalize(m[1]), normalize(m[2]));
        const inverseRotation = transpose(rot);
        const worldOffset = inverseRotation.mul(offset);
        const blendedOffset = mix(offset, worldOffset, vProgress);
        _pos.addAssign(blendedOffset);
      }).Else(() => {
        _pos.addAssign(offset);
      });
    });

    return _pos;
  },
);

/** TSL node for computing particle rotation over time. */
const rotationNode = /*@__PURE__*/ Fn(([rot, rotSpeed, age]) => {
  const tau = float(Math.PI * 2.0).toConst();
  const init = rot.z.add(1.0).mul(0.5).mul(tau);
  const angle = init.add(rotSpeed.z.mul(age));
  const wrapped = angle.mod(tau);
  return wrapped.add(tau).mod(tau);
});

/** TSL node for computing particle scale with fade. */
const scaleNode = /*@__PURE__*/ Fn(([fadeSize, scale, vProgress]) => {
  const uFadeSize = vec2(fadeSize[0], fadeSize[1]).toVar();
  return smoothstep(0.0, uFadeSize.x, vProgress)
    .mul(smoothstep(1.01, uFadeSize.y, vProgress))
    .mul(scale);
});

/** TSL node for computing particle color with gradient lookup and alpha mapping. */
const colorNode = /*@__PURE__*/ Fn(
  ([
    colors,
    intensity,
    fadeAlpha,
    fadeAlphaMap,
    vProgress,
    uColorGradient,
    uAlphaMapCount,
    vAlphaMapUVOffsetX,
    vAlphaMapUVOffsetY,
    alphaMap,
  ]) => {
    const vColorGradientRow = range(0, colors.length - 1).toVar();
    const uColorGradientRows = float(colors.length).toVar();
    const uIntensity = float(intensity).toVar();
    const uFadeAlpha = vec2(fadeAlpha[0], fadeAlpha[1]).toVar();
    const uFadeAlphaMap = vec2(fadeAlphaMap[0], fadeAlphaMap[1]).toVar();

    const u = vProgress;
    const v = vColorGradientRow.add(0.5).div(max(uColorGradientRows, 1.0));
    const finalColor = uColorGradient.sample(vec2(u, v)).rgb;
    finalColor.mulAssign(uIntensity);

    const alpha = smoothstep(0.0, uFadeAlpha.x, vProgress).mul(
      smoothstep(1.01, uFadeAlpha.y, vProgress),
    );

    const vUv = uv();

    If(uAlphaMapCount.equal(0), () => {
      const center = vec2(0.5).toVar();
      const dist = distance(vUv, center);
      const radius = float(0.5);
      const feather = float(0.98);
      const _alpha = float(1.0).sub(smoothstep(radius.sub(feather), radius, dist));
      alpha.assign(_alpha.mul(alpha));
      If(_alpha.lessThan(0.01), () => Discard());
    }).ElseIf(uAlphaMapCount.greaterThan(0), () => {
      const startU = vAlphaMapUVOffsetX.add(vUv.x).div(uAlphaMapCount);
      const startUV = vec2(startU, vUv.y);
      const startAlpha = alphaMap.sample(startUV).a;

      If(uAlphaMapCount.greaterThan(1), () => {
        const endU = vAlphaMapUVOffsetY.add(vUv.x).div(uAlphaMapCount);
        const endUV = vec2(endU, vUv.y);
        const endAlpha = alphaMap.sample(endUV).a;
        const morphProgress = smoothstep(uFadeAlphaMap.x, uFadeAlphaMap.y, vProgress);
        const morphedAlpha = mix(startAlpha, endAlpha, morphProgress);
        alpha.assign(morphedAlpha.mul(alpha));
      }).Else(() => {
        alpha.assign(startAlpha.mul(alpha));
      });
    });

    return vec4(finalColor, alpha);
  },
);

/** Custom THREE.Node for instance position computation. */
class InstancePositionNode extends THREE.Node {
  constructor() {
    super("vec3");
    this.updateType = THREE.NodeUpdateType.OBJECT;
  }

  setup(frame) {
    const mesh = frame.object;
    const { attributes, uniforms, config, easingIndex } = mesh.userData;

    const uPosition = uniforms.uPosition;

    const _static = float(config.emitter.static).toVar();
    const posX = attributes.instance.element(idx7.add(0));
    const posY = attributes.instance.element(idx7.add(1));
    const posZ = attributes.instance.element(idx7.add(2));
    const pos = vec3(posX, posY, posZ).add(uPosition.mul(_static));

    const dirX = attributes.instanceDirection.element(idx3.add(0));
    const dirY = attributes.instanceDirection.element(idx3.add(1));
    const dirZ = attributes.instanceDirection.element(idx3.add(2));
    const dir = vec3(dirX, dirY, dirZ);

    const time = uniforms.uTime;
    const uGravity = vec3(...config.particles.gravity);

    const worldUpRight = bool(config.emitter.worldUpRight);

    const startTime = attributes.instanceLifetime.element(idx2.add(0));
    const duration = attributes.instanceLifetime.element(idx2.add(1));

    const speed = attributes.instanceSpeed.element(instanceIndex).toVar();
    const age = select(speed.lessThan(0.0), duration.sub(time.sub(startTime)), time.sub(startTime));

    return positionNode(
      pos,
      age,
      duration,
      vProgress,
      uGravity,
      dir,
      speed,
      worldUpRight,
      easingIndex,
    );
  }
}

/** Custom THREE.Node for instance rotation computation. */
class InstanceRotationNode extends THREE.Node {
  constructor() {
    super("vec3");
    this.updateType = THREE.NodeUpdateType.OBJECT;
  }

  setup(frame) {
    const mesh = frame.object;
    const { attributes, uniforms } = mesh.userData;

    const rotX = attributes.instance.element(idx7.add(3));
    const rotY = attributes.instance.element(idx7.add(4));
    const rotZ = attributes.instance.element(idx7.add(5));
    const rot = vec3(rotX, rotY, rotZ);

    const rotSpeedX = attributes.instanceRotationSpeed.element(idx3.add(0));
    const rotSpeedY = attributes.instanceRotationSpeed.element(idx3.add(1));
    const rotSpeedZ = attributes.instanceRotationSpeed.element(idx3.add(2));
    const rotSpeed = vec3(rotSpeedX, rotSpeedY, rotSpeedZ);

    const time = uniforms.uTime;
    const startTime = attributes.instanceLifetime.element(idx2.add(0));
    const duration = attributes.instanceLifetime.element(idx2.add(1));

    const speed = attributes.instanceSpeed.element(instanceIndex).toVar();
    const age = select(speed.lessThan(0.0), duration.sub(time.sub(startTime)), time.sub(startTime));

    return rotationNode(rot, rotSpeed, age);
  }
}

/** Custom THREE.Node for instance scale computation. */
class InstanceScaleNode extends THREE.Node {
  constructor() {
    super("vec3");
    this.updateType = THREE.NodeUpdateType.OBJECT;
  }

  setup(frame) {
    const mesh = frame.object;
    const { attributes, config } = mesh.userData;

    const scale = attributes.instance.element(idx7.add(6));

    return scaleNode(config.particles.fadeSize, scale, vProgress);
  }
}

/** Custom THREE.Node for instance color computation. */
class InstanceColorNode extends THREE.Node {
  constructor() {
    super("vec3");
    this.updateType = THREE.NodeUpdateType.OBJECT;
  }

  setup(frame) {
    const mesh = frame.object;
    const { attributes, uniforms, config, alphaMapCount } = mesh.userData;

    const uAlphaMapCount = uint(alphaMapCount).toVar();

    const vAlphaMapUVOffsetX = attributes.instanceAlphaMapUVOffset.element(idx2.add(0));
    const vAlphaMapUVOffsetY = attributes.instanceAlphaMapUVOffset.element(idx2.add(1));

    return colorNode(
      config.particles.colors,
      config.particles.intensity,
      config.particles.fadeAlpha,
      config.particles.fadeAlphaMap,
      vProgress,
      uniforms.uColorGradient,
      uAlphaMapCount,
      vAlphaMapUVOffsetX,
      vAlphaMapUVOffsetY,
      uniforms.alphaMap,
    );
  }
}

/**
 * Shared sprite material template with custom instance nodes.
 * Cloned by Particles class to create per-system materials.
 */
export const mat = new THREE.SpriteNodeMaterial();
mat.positionNode = new InstancePositionNode();
mat.rotationNode = new InstanceRotationNode();
mat.scaleNode = new InstanceScaleNode();
mat.colorNode = new InstanceColorNode();
