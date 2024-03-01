// overrides for eslint:recommended
const StandardConfig = {
  isEnabled: true,
  rules: {
    "sort-imports": ["error", { ignoreDeclarationSort: true }],
    quotes: ["error", "double"],
    semi: ["error", "always"],
    "no-unused-vars": ["off", { argsIgnorePattern: "^_" }], // typescript handles this
    "no-use-before-define": ["off"],
    camelcase: ["error", { properties: "never", ignoreDestructuring: true }],
  },
};

// npm i -D eslint-plugin-unicorn
const UnicornConfig = {
  isEnabled: true,
  extends: ["plugin:unicorn/recommended"],
  rules: {
    "unicorn/consistent-destructuring": "off",
    "unicorn/custom-error-definition": "off",
    "unicorn/no-array-for-each": "off",
    "unicorn/no-keyword-prefix": "off",
    "no-negated-condition": "off",
    "no-nested-ternary": "off",
    "unicorn/no-null": "off",
    "unicorn/no-static-only-class": "off",
    "unicorn/no-unused-properties": "off",
    "unicorn/prefer-dom-node-text-content": "off",
    "unicorn/prefer-json-parse-buffer": "off",
    "unicorn/prefer-query-selector": "off",
    "unicorn/prevent-abbreviations": "off",
    // Turned off because we can't distinguish `widow.postMessage` and `{Worker,MessagePort,Client,BroadcastChannel}#postMessage()`
    // See #1396
    "unicorn/require-post-message-target-origin": "off",
    "unicorn/string-content": "off",
  },
};

// npm i -D eslint-plugin-jsdoc
const JsdocConfig = {
  isEnabled: false,
  plugins: ["jsdoc"],
  extends: ["plugin:jsdoc/recommended"],
  rules: {
    "jsdoc/require-description": "off",
    "jsdoc/require-param-description": "off",
    "jsdoc/require-returns-description": "off",
    "jsdoc/no-undefined-types": "off", // checking is done by TS lsp
    "jsdoc/require-returns": ["warn", { forceRequireReturn: true }],
  },
};

// npm i -D eslint-plugin-import
const ImportsPluginConfig = {
  isEnabled: true,
  extends: ["plugin:import/typescript", "plugin:import/errors", "plugin:import/warnings"],
  rules: {
    "import/newline-after-import": ["error"],
  },
};

// npm i -D eslint-plugin-unused-imports
const UnusedImportsConfig = {
  isEnabled: true,
  plugins: ["unused-imports"],
  rules: {
    "unused-imports/no-unused-imports": "error",
  },
};

// npm i -D typescript typescript-eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
const TypescriptConfig = {
  isEnabled: true,
  plugins: ["@typescript-eslint"],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json"], // extend config when plugin:@typescript-eslint is installed
  },
  rules: {
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-empty-function": ["error" /*, { allow: ["arrowFunctions"] }*/],
    "@typescript-eslint/strict-boolean-expressions": "error",
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        checksVoidReturn: {
          attributes: false,
        },
      },
    ],
    "@typescript-eslint/explicit-function-return-type": ["error", { allowExpressions: true }],
  },
};

// npm i -D eslint-plugin-react
const ReactConfig = {
  isEnabled: false,
  extends: ["plugin:react/recommended"],
};

// npm i -D eslint-plugin-react-hooks
const ReactHooksConfig = {
  isEnabled: false,
  extends: ["plugin:react-hooks/recommended"],
};

// npm i -D eslint-plugin-prettier eslint-config-prettier
const PrettierConfig = {
  isEnabled: true,
  extends: ["prettier"],
};

/**
 *
 * @param {Record<string, any>} configData
 * @param {string} keyName
 * @param {Record<string, any>} defaultReturn
 * @returns {Record<string, any>}
 */
function getConfig(configData, keyName, defaultReturn) {
  if (!Object.keys(configData).includes(keyName)) {
    throw new Error(`${keyName} is not present in object`);
  }

  if (!configData.isEnabled) {
    return defaultReturn;
  }

  return configData[keyName];
}

const FinalConfig = {
  env: {
    browser: true,
    es2021: true,
  },
  plugins: [
    ...getConfig(JsdocConfig, "plugins", []),
    ...getConfig(TypescriptConfig, "plugins", []),
    ...getConfig(UnusedImportsConfig, "plugins", []),
  ],
  extends: [
    "eslint:recommended",
    ...getConfig(UnicornConfig, "extends", []),
    ...getConfig(JsdocConfig, "extends", []),
    ...getConfig(ImportsPluginConfig, "extends", []),
    ...getConfig(TypescriptConfig, "extends", []),
    ...getConfig(ReactConfig, "extends", []),
    ...getConfig(ReactHooksConfig, "extends", []),
    ...getConfig(PrettierConfig, "extends", []),
  ],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parser: getConfig(TypescriptConfig, "parser"),
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ...getConfig(TypescriptConfig, "parserOptions", {}),
  },

  ignorePatterns: ["dist/**", "build.js", "buildUtil.js", ".eslintrc.cjs"],
  rules: {
    ...getConfig(StandardConfig, "rules", {}),
    ...getConfig(UnicornConfig, "rules", {}),
    ...getConfig(JsdocConfig, "rules", {}),
    ...getConfig(ImportsPluginConfig, "rules", {}),
    ...getConfig(UnusedImportsConfig, "rules", {}),
    ...getConfig(TypescriptConfig, "rules", {}),
  },
};

module.exports = FinalConfig;
