import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "threeparticles.min",
    },
    rollupOptions: {
      external: ["three", "three/webgpu", "three/tsl"],
    },
    minify: "esbuild",
    sourcemap: true,
    emptyOutDir: false,
  },
});
