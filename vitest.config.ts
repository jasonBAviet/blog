import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Map alias "@/..." -> project root, khớp với "paths" trong tsconfig.json
// để Vitest resolve được các import runtime như "@/src/...".
const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": root,
    },
  },
});
