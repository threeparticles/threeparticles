<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/threeparticles/threeparticles/refs/heads/main/logo-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/threeparticles/threeparticles/refs/heads/main/logo-light.svg">
    <img src="https://raw.githubusercontent.com/threeparticles/threeparticles/refs/heads/main/logo-light.svg" alt="threeparticles" height="40">
  </picture>
</p>

<p align="center">WebGPU powered particle engine for Three.js</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@threeparticles/core"><img src="https://img.shields.io/npm/v/@threeparticles/core.svg" alt="npm version"></a>
  <a href="https://raw.githubusercontent.com/threeparticles/threeparticles/refs/heads/main/LICENSE"><img src="https://img.shields.io/npm/l/@threeparticles/core.svg" alt="license"></a>
</p>

## Features

- WebGPU accelerated rendering
- Color gradients with alpha fading
- Simple config-based API

## Installation

```bash
npm install @threeparticles/core three
```

Requires `three >= 0.160.0`

## Quick Start

```javascript
import * as THREE from "three/webgpu";
import { Particles } from "@threeparticles/core";

// Create your Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
const renderer = new THREE.WebGPURenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
await renderer.init();

// Create particle system
const particles = new Particles({
  particles: {
    count: 500,
  },
  emitter: {
    loop: true,
    lifetime: [1, 3],
    speed: [1, 2],
    size: [0.05, 0.1],
  },
});

scene.add(particles);
particles.start();

// Animation loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  particles.update(clock.getDelta());
  renderer.render(scene, camera);
}

animate();
```

## React Three Fiber

Native R3F support via subpath export:

```bash
npm install @threeparticles/core @react-three/fiber react three
```

```tsx
import * as THREE from "three/webgpu";
import { Canvas } from "@react-three/fiber";
import { Particles } from "@threeparticles/core/react";

function App() {
  return (
    <Canvas
      gl={async (props) => {
        const renderer = new THREE.WebGPURenderer({
          ...props,
          antialias: true,
        });
        await renderer.init();
        return renderer;
      }}
    >
      <Particles
        config={{
          particles: { count: 1000 },
          emitter: { loop: true, lifetime: [1, 2], speed: [1, 3] },
        }}
      />
    </Canvas>
  );
}
```

> **Note:** Requires WebGPU renderer - use the async `gl` prop pattern shown above.

## Examples

### Fire Effect

```javascript
const fire = new Particles({
  particles: {
    count: 200,
    colors: [
      [
        { color: "yellow", stop: 0 },
        { color: "orange", stop: 0.3 },
        { color: "red", stop: 0.7 },
        { color: "#330000", stop: 1 },
      ],
    ],
    fadeAlpha: [0, 0.7],
    fadeSize: [1, 1.5],
  },
  render: {
    blendingMode: THREE.AdditiveBlending,
  },
  emitter: {
    loop: true,
    spawnMode: "time",
    rate: 50,
    lifetime: [0.5, 1.5],
    speed: [1, 3],
    size: [0.2, 0.4],
    directionMin: [-0.1, 1, -0.1],
    directionMax: [0.1, 1, 0.1],
    startPositionMin: [-0.5, 0, -0.5],
    startPositionMax: [0.5, 0.1, 0.5],
  },
});
```

### Fountain Effect

```javascript
const fountain = new Particles({
  particles: {
    count: 500,
    gravity: [0, -9.8, 0],
    colors: [
      [
        { color: "cyan", stop: 0 },
        { color: "blue", stop: 1 },
      ],
    ],
  },
  emitter: {
    loop: true,
    spawnMode: "time",
    rate: 100,
    lifetime: [2, 3],
    speed: [5, 8],
    size: [0.05, 0.1],
    directionMin: [-0.2, 1, -0.2],
    directionMax: [0.2, 1, 0.2],
  },
});
```

## Links

| Resource      | URL                               |
| ------------- | --------------------------------- |
| Documentation | https://docs.threeparticles.com   |
| Visual Editor | https://editor.threeparticles.com |
| Website       | https://threeparticles.com        |

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on [GitHub](https://github.com/threeparticles/threeparticles).

## License

[MIT](./LICENSE)
