import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import {
  getUserscriptPaths,
  parseInitialComments,
  prependCommentsToJsFiles,
  slugifyAndCapitalize,
} from "./buildUtil.js";

const CURRENT_FILE_PATH = fileURLToPath(import.meta.url);

const BUILD_DIR = path.join(path.dirname(CURRENT_FILE_PATH), "./dist");

const SRC_SUBPATHS = ["__public", "__private"];
const GET_GLOB = (srcSubpath) => `./src/${srcSubpath}/**/*.ts`;

/**
 *
 * @param {string} inFile
 * @param {string} buildDir
 * @param {string} jsOutputName
 */
async function buildBundle(inFile, buildDir, jsOutputName) {
  // Convert the file URL to a file path

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
          "@lib": CURRENT_FILE_PATH,
        },
      },
    });
  } catch (error) {
    console.error("Build failed:", error);
    return;
  }
  console.log("Build successful!");
}

SRC_SUBPATHS.forEach((srcSubPath) => {
  const srcGlob = GET_GLOB(srcSubPath);
  getUserscriptPaths(srcGlob).forEach(async (tsFilePath) => {
    const jsOutputName = path.basename(tsFilePath).replace(/\.ts$/, ".js");
    const comments = parseInitialComments(tsFilePath);

    const finalBuildDir = path.join(BUILD_DIR, srcSubPath);
    await buildBundle(tsFilePath, finalBuildDir, jsOutputName);
    setTimeout(() => {
      prependCommentsToJsFiles(path.join(finalBuildDir, jsOutputName), comments);
    }, 500);
  });
});
