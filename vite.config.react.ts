import { defineConfig } from "vite";
import { resolve } from "path";
import { copyFileSync } from "fs";

export default defineConfig({
  plugins: [
    {
      name: "copy-react-types",
      closeBundle() {
        copyFileSync(
          resolve(__dirname, "src/react/react.d.ts"),
          resolve(__dirname, "dist/react.d.ts"),
        );
      },
    },
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/react/index.ts"),
      formats: ["es"],
      fileName: "react",
    },
    rollupOptions: {
      external: [
        "react",
        "react/jsx-runtime",
        "@react-three/fiber",
        "three",
        "three/webgpu",
        "three/tsl",
      ],
    },
    emptyOutDir: false,
    sourcemap: true,
  },
  esbuild: {
    jsx: "automatic",
  },
});
