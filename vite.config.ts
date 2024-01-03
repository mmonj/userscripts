import path from "path";
import { ConfigEnv, defineConfig } from "vite";
import { getUserscriptPaths } from "./buildUtil";

const modeTypes = ["prod", "dev"] as const;
type TMode = (typeof modeTypes)[number];

const modeOutdirMap: Record<TMode, string> = {
  prod: "dist/prod",
  dev: "dist/dev",
};

export default defineConfig(({ mode }: ConfigEnv) => {
  if (!modeTypes.includes(mode as TMode)) {
    throw new Error(`'${mode}' is not a valid mode. Valid modes: ${modeTypes}`);
  }

  return {
    // plugins: [
    //   terser({
    //     format: {
    //       comments: /.*==UserScript==.*/, // Preserve comments that match this pattern
    //     },
    //   }),
    // ],
    build: {
      minify: false,
      outDir: modeOutdirMap[mode as TMode],
      sourcemap: true,
      target: "esnext",
      lib: {
        entry: getUserscriptPaths("./src")[0],
        fileName: (format, entryName) => `${entryName}.js`,
        formats: ["umd"],
      },
    },
    resolve: {
      alias: {
        "@lib": path.resolve(__dirname, "./src/"),
      },
    },
  };
});

// setTimeout(() => {
//   getUserscriptPaths("./src").forEach((tsFilePath) => {
//     const comments = parseInitialComments(tsFilePath);
//     prependCommentsToJsFiles(tsFilePath, "./dist/prod", comments);
//   });
// }, 500);
