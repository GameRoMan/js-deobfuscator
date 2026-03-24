import { defineConfig } from "@gameroman/config/oxlint";

export default defineConfig({
  ignorePatterns: ["example/"],
  rules: { "no-explicit-any": "warn" },
});
