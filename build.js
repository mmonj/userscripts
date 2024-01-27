import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import {
  getUserscriptPaths,
  parseInitialComments,
  prependCommentsToJsFiles,
  slugifyAndCapitalize,
} from "./buildUtil.js";

/**
 *
 * @param {string} inFile
 * @param {string} buildDir
 * @param {string} jsOutputName
 */
async function buildBundle(inFile, buildDir, jsOutputName) {
  // Get the current module's file URL
  const currentFileUrl = import.meta.url;
  // Convert the file URL to a file path
  const currentFilePath = fileURLToPath(currentFileUrl);

  try {
    await build({
      configFile: false,
      // root: "./",
      build: {
        emptyOutDir: false,
        minify: false,
        outDir: buildDir,
        sourcemap: false,
        target: "esnext",
        lib: {
          entry: inFile,
          name: slugifyAndCapitalize(jsOutputName, "MM"),
          fileName: () => jsOutputName,
          // fileName: (format, entryName) => `${entryName}.js`,
          formats: ["umd"],
        },
      },
      resolve: {
        alias: {
          "@lib": currentFilePath,
        },
      },
    });
  } catch (error) {
    console.error("Build failed:", error);
  }
  console.log("Build successful!");
}

getUserscriptPaths("./src").forEach(async (tsFilePath) => {
  const buildDir = "./dist/prod";

  const jsOutputName = path.basename(tsFilePath).replace(/\.ts$/, ".js");
  const comments = parseInitialComments(tsFilePath);
  await buildBundle(tsFilePath, buildDir, jsOutputName);
  setTimeout(() => {
    prependCommentsToJsFiles(path.join(buildDir, jsOutputName), comments);
  }, 500);
});
