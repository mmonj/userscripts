import path from "path";
import { fileURLToPath } from "url";
import { build } from "vite";
import {
  getCorrespondingJsFile,
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
async function buildLibrary(inFile, buildDir, jsOutputName) {
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
          name: slugifyAndCapitalize(jsOutputName),
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

  const jsOutputName = getCorrespondingJsFile(tsFilePath);
  const comments = parseInitialComments(tsFilePath);
  await buildLibrary(tsFilePath, buildDir, jsOutputName);
  setTimeout(() => {
    prependCommentsToJsFiles(path.join(buildDir, jsOutputName), comments);
  }, 500);
});
