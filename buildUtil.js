import fs from "node:fs";
import path from "node:path";

// ts file names that end with this string will be targeted for transpilation/bundling
const ENTRYPOINT_IDENTIFIER = ".user.ts";

/**
 *
 * @param {string} directoryPath
 * @returns {string[]}
 */
export function getUserscriptPaths(directoryPath) {
  /**@type {string[]} */
  const userscriptsFilePaths = [];

  const files = fs.readdirSync(directoryPath);

  files.forEach((file) => {
    if (file.endsWith(ENTRYPOINT_IDENTIFIER)) {
      const filePath = path.join(directoryPath, file);
      userscriptsFilePaths.push(filePath);
    }
  });

  return userscriptsFilePaths;
}

/**
 * Retain comments included at the top of the file (series of // comments). Useful for *monkey userscripts
 * @param {string} tsFilePath
 * @returns {string[]}
 */
export function parseInitialComments(tsFilePath) {
  /**@type {string[]} */
  const commentsList = [];

  const content = fs.readFileSync(tsFilePath, "utf8");

  const lines = content.split("\n");
  for (const line of lines) {
    if (line.trim().startsWith("//")) {
      commentsList.push(line.trim());
    } else {
      return commentsList;
    }
  }

  return commentsList;
}

/**
 *
 * @param {string} jsFilePath
 * @param {string[]} comments
 * @returns {void}
 */
export function prependCommentsToJsFiles(jsFilePath, comments) {
  if (comments.length === 0) {
    return;
  }

  try {
    const jsFileContent = fs.readFileSync(jsFilePath, "utf8");
    const newContent = comments.join("\n") + "\n\n" + jsFileContent;

    fs.writeFileSync(jsFilePath, newContent, "utf8");
    console.log(`Comments prepended to ${jsFilePath} successfully.`);
  } catch (error) {
    console.error(`Error writing to file: ${jsFilePath}`);
    console.error(error);
  }
}

/**
 *
 * @param {string} inputString
 * @param {string} prefix
 * @returns {string}
 */
export function slugifyAndCapitalize(inputString, prefix) {
  if (inputString.length === 0) {
    throw new Error("The input string is length 0");
  }

  const prefixRegex = /^\w*$/g;
  if (!prefixRegex.test(prefix)) {
    throw new Error("Prefix can only contain alphanumeric characters");
  }

  let dunderPrefix = "";
  if (prefix.length > 0) {
    dunderPrefix = `__${prefix}_`;
  }

  const slugifiedString = inputString.replaceAll(/[^A-Za-z]+/g, "_");

  return `${dunderPrefix}${slugifiedString}__`.toUpperCase();
}
