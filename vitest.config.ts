// New: vitest.config.ts (current best practice)
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { projects: ["packages/*"] },
});
