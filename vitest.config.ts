import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@boardroom/engine": path.resolve(__dirname, "packages/engine/src/index.ts"),
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    globals: true,
    exclude: ["e2e/**", "node_modules/**", "video-demo/**"],
  },
});
