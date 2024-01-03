import fs from "fs";
import path from "path";

/**
 *
 * @param {string} directoryPath
 * @returns {string[]}
 */
export function getUserscriptPaths(directoryPath) {
  // Initialize an empty list to store the user files
  /**@type {string[]} */
  const userscriptsFilePaths = [];

  // Read the contents of the directory
  const files = fs.readdirSync(directoryPath);

  // Iterate through the files
  files.forEach((file) => {
    // Check if the file ends with 'user.ts'
    if (file.endsWith("user.ts")) {
      // Construct the full path of the file
      const filePath = path.join(directoryPath, file);

      // Add the file path to the user list
      userscriptsFilePaths.push(filePath);
    }
  });

  return userscriptsFilePaths;
}

/**
 *
 * @param {string} tsFilePath
 * @returns {string[]}
 */
export function parseInitialComments(tsFilePath) {
  /**@type {string[]} */
  const commentsList = [];

  // Read the content of the file
  const content = fs.readFileSync(tsFilePath, "utf-8");

  // Split the content into lines and check for comments
  const lines = content.split("\n");
  for (const line of lines) {
    // Check if the line is a JavaScript comment
    if (line.trim().startsWith("//") || line.trim().startsWith("/*")) {
      commentsList.push(line.trim());
    } else {
      return commentsList;
    }
  }

  return commentsList;
}

// Function to prepend comments to user.js files

/**
 *
 * @param {string} jsFilePath
 * @param {string[]} comments
 * @returns {void}
 */
export function prependCommentsToJsFiles(jsFilePath, comments) {
  try {
    const jsFileContent = fs.readFileSync(jsFilePath, "utf-8");
    const newContent = comments.join("\n") + "\n\n" + jsFileContent;

    fs.writeFileSync(jsFilePath, newContent, "utf-8");
    console.log(`Comments prepended to ${jsFilePath} successfully.`);
  } catch (error) {
    console.error(`Error writing to file: ${jsFilePath}`);
    console.error(error);
  }
}

/**
 *
 * @param {string} tsFilePath
 * @returns {string}
 */
export function getCorrespondingJsFile(tsFilePath) {
  return path.basename(tsFilePath).replace(/\.ts$/, ".js");
}

/**
 *
 * @param {string} inputString
 * @returns {string}
 */
export function slugifyAndCapitalize(inputString) {
  if (inputString.length === 0) {
    throw new Error("The input string is length 0");
  }

  const slugifiedString = inputString.replace(/[^a-zA-Z]+/g, "_");

  return `__MM_${slugifiedString}__`.toUpperCase();
}
