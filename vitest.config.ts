import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@boardroom/engine": path.resolve(__dirname, "packages/engine/src/index.ts"),
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    globals: true,
  },
});
