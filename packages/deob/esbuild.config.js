import esbuild from "esbuild";

/**
 * @type {esbuild.BuildOptions[]}
 */
const configs = [
  {
    entryPoints: ["src/index.ts"],
  },
  {
    entryPoints: ["src/cli.ts"],
    bundle: false,
  },
];

for (const config of configs) {
  const ctx = await esbuild.context({
    bundle: true,
    format: "esm",
    platform: "node",
    outdir: "dist",
    sourcemap: true,
    packages: "external",
    logLevel: "info",
    ...config,
  });

  await ctx.rebuild();
  await ctx.dispose();
}
