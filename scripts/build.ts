import * as esbuild from "esbuild";
import path from "path";
import fs from "fs";

const rootDir = process.cwd();
const production = process.argv.includes("--production");
const watch = process.argv.includes("--watch");
const analyze = process.argv.includes("--analyze");

const aliases: Record<string, string> = {
  "@__tests__": path.resolve(rootDir, "__tests__"),
  "@": path.resolve(rootDir, "src"),
};

const aliasFilterRegex = new RegExp(
  `^(${Object.keys(aliases)
    .sort((a, b) => b.length - a.length)
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")})\\/`
);

const aliasPlugin: esbuild.Plugin = {
  name: "alias",
  setup(build: esbuild.PluginBuild) {
    build.onResolve({ filter: aliasFilterRegex }, (args) => {
      for (const [alias, targetPath] of Object.entries(aliases)) {
        if (!args.path.startsWith(`${alias}/`)) continue;

        const subPath = args.path.slice(alias.length);
        const absPath = path.join(targetPath, subPath);

        if (!path.extname(absPath)) {
          const tsFile = `${absPath}.ts`;
          const indexFile = path.join(absPath, "index.ts");
          if (fs.existsSync(tsFile)) return { path: tsFile };
          if (fs.existsSync(indexFile)) return { path: indexFile };
        }

        return { path: absPath };
      }

      return null;
    });
  },
};

const problemMatcherPlugin: esbuild.Plugin = {
  name: "problem-matcher",
  setup(build: esbuild.PluginBuild) {
    build.onStart(() => {
      console.log("[watch] build started");
    });

    build.onEnd((result: esbuild.BuildResult) => {
      for (const err of result.errors) {
        console.error(`✘ [ERROR] ${err.text}`);
        if (err.location) {
          const { file, line, column } = err.location;
          console.error(`  ${file}:${line}:${column}`);
        }
      }
      console.log("[watch] build finished");
    });
  },
};

const buildOptions: esbuild.BuildOptions = {
  entryPoints: ["src/extension.ts"],
  outfile: "dist/extension.js",
  bundle: true,
  format: "cjs",
  platform: "node",
  target: "node22",
  external: ["vscode"],
  minify: production,
  sourcemap: !production,
  sourcesContent: false,
  logLevel: "silent",
  metafile: analyze,
  plugins: [aliasPlugin, problemMatcherPlugin],
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function main(): Promise<void> {
  const ctx = await esbuild.context(buildOptions);

  if (watch) {
    console.log("Watching for changes...");
    await ctx.watch();
    return;
  }

  const start = Date.now();
  const result = await ctx.rebuild();
  await ctx.dispose();

  const outfilePath = path.resolve(rootDir, "dist/extension.js");
  const size = fs.statSync(outfilePath).size;
  console.log(
    `Build complete in ${Date.now() - start}ms (${production ? "production" : "development"}) — ${formatBytes(size)}`
  );

  if (analyze && result.metafile) {
    const metafilePath = path.resolve(rootDir, "dist/metafile.json");
    fs.writeFileSync(metafilePath, JSON.stringify(result.metafile, null, 2));
    console.log(`Metafile written to ${metafilePath}`);
    console.log(await esbuild.analyzeMetafile(result.metafile));
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
