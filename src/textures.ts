import * as THREE from "three/webgpu";
import type { ColorStop } from "./types";

/**
 * Creates a texture atlas by combining multiple textures into a horizontal strip.
 *
 * @param textures - Array of textures to combine
 * @param onLoad - Optional callback when all textures are loaded
 * @param size - Size of each texture slot in pixels (default: 512)
 * @param filter - Texture filtering mode
 * @returns Combined canvas texture, or null if no textures provided
 */
export function createTextureAtlas(
  textures: THREE.Texture[],
  onLoad?: () => void,
  size = 512,
  filter?: THREE.MagnificationTextureFilter,
): THREE.CanvasTexture | null {
  if (!textures || textures.length === 0) return null;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const count = textures.length;
  canvas.width = size * count;
  canvas.height = size;

  let loadedCount = 0;
  let imagesLoaded = 0;

  textures.forEach((texture, i) => {
    const img = texture.image as HTMLImageElement;
    if (img && img.complete && img.width > 0) {
      ctx.drawImage(img, i * size, 0, size, size);
      imagesLoaded++;
    } else {
      const checkAndDraw = () => {
        const img = texture.image as HTMLImageElement;
        if (img && img.complete && img.width > 0) {
          ctx.drawImage(img, i * size, 0, size, size);
          loadedCount++;
          if (loadedCount === count - imagesLoaded) {
            atlasTexture.needsUpdate = true;
            if (onLoad) onLoad();
          }
        } else {
          setTimeout(checkAndDraw, 100);
        }
      };
      checkAndDraw();
    }
  });

  const atlasTexture = new THREE.CanvasTexture(canvas);
  if (filter !== undefined) {
    atlasTexture.minFilter = filter;
    atlasTexture.magFilter = filter;
  }
  atlasTexture.needsUpdate = true;

  return atlasTexture;
}

/**
 * Creates a gradient lookup texture from color stop definitions.
 *
 * @param rows - Array of color stop arrays, one per row
 * @param width - Width of the texture in pixels (default: 512)
 * @returns Canvas texture with gradient data
 */
export function createColorGradientTexture(rows: ColorStop[][], width = 512): THREE.CanvasTexture {
  if (!rows || rows.length === 0) rows = [[{ color: "white", stop: 0 }]];

  const normalized = rows.map((row) => {
    const sorted = [...row].sort((a, b) => a.stop - b.stop);
    if (sorted[0].stop > 0) sorted.unshift({ color: sorted[0].color, stop: 0 });
    if (sorted[sorted.length - 1].stop < 1)
      sorted.push({ color: sorted[sorted.length - 1].color, stop: 1 });
    return sorted;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  canvas.width = width;
  canvas.height = normalized.length;

  for (let y = 0; y < normalized.length; y++) {
    const stops = normalized[y];
    const g = ctx.createLinearGradient(0, 0, width, 0);
    for (const s of stops) g.addColorStop(THREE.MathUtils.clamp(s.stop, 0, 1), s.color);
    ctx.fillStyle = g;
    ctx.fillRect(0, y, width, 1);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;

  return tex;
}
