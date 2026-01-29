import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [dts({ rollupTypes: true })],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "threeparticles",
    },
    rollupOptions: {
      external: ["three", "three/webgpu", "three/tsl"],
    },
    minify: false,
    sourcemap: true,
  },
});
