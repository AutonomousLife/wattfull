import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  base: "/blockworks/",
  build: {
    outDir: resolve(__dirname, "../public/blockworks"),
    emptyOutDir: true,
    sourcemap: false,
  },
});
