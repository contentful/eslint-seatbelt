// This file is generated by running ./scripts/make-json-schemas.ts

import type { Rule } from "eslint"
type Schema = Rule.RuleMetaData["schema"]

export const SeatbeltConfigSchema = {
  description:
    'Configuration for seatbelt can be provided in a few ways:\n\n1. Defined in the shared `settings` object in your ESLint config. This\n   requires also configuring the `eslint-seatbelt/configure` rule.\n\n    ```js\n    // in eslint.config.js\n    const config = [\n      {\n        settings: {\n          seatbelt: {\n            // ...\n          }\n        },\n        rules: {\n          "eslint-seatbelt/configure": "error",\n        }\n      }\n    ]\n    ```\n\n2. Using the `eslint-seatbelt/configure` rule in your ESLint config.\n   This can be used to override settings for specific files in legacy ESLint configs.\n   Any configuration provided here will override the shared `settings` object.\n\n    ```js\n    // in .eslintrc.js\n    module.exports = {\n      rules: {\n        "eslint-seatbelt/configure": "error",\n      },\n      overrides: [\n        {\n          files: ["some/path/*"],\n          rules: {\n            "eslint-seatbelt/configure": ["error", { seatbeltFile: "some/path/eslint.seatbelt.tsv" }]\n          },\n        },\n      ],\n    }\n    ```\n3. The settings in config files can be overridden with environment variables when running `eslint` or other tools.\n\n   ```bash\n   SEATBELT_FILE=some/path/eslint.seatbelt.tsv SEATBELT_FROZEN=1 eslint\n   ```',
  type: "object",
  properties: {
    seatbeltFile: {
      description:
        "The seatbelt file stores the max error counts allowed for each file. Should\nbe an absolute path.\n\nIf not provided, $SEATBELT_PWD/eslint.seatbelt.tsv or $PWD/eslint.seatbelt.tsv will be used.\n\n```js\n// in eslint.config.js\nconst config = [\n  {\n    settings: {\n      seatbelt: {\n        // commonjs\n        seatbeltFile: `${__dirname}/eslint.seatbelt.tsv`\n        // esm\n        seatbeltFile: new URL('./eslint.seatbelt.tsv', import.meta.url).pathname\n      }\n    }\n  }\n]\n```\n\nYou can also set this with environment variable `SEATBELT_FILE`:\n\n```bash\nSEATBELT_FILE=.config/custom-seatbelt-file eslint\n```",
      type: "string",
    },
    keepRules: {
      description:
        'By default whenever a file is linted and a rule has no errors, that rule\'s\nmax errors for the file is set to zero.\n\nHowever with typescript-eslint, it can be helpful to have two ESLint configs:\n\n- A default ESLint config with only syntactic rules enabled that don\'t\n  require typechecking, that runs on developer machines and in their editor.\n- A CI-only ESLint config with only type-aware rules enabled that requires\n  typechecking. Since these rules require typechecking, they can be too\n  slow to run in interactive contexts.\n\nTo avoid this, set `keepRules` to the names of *disabled but known rules*\nwhile linting.\n\nExample:\n\n```js\n// Default ESLint config\nmodule.exports = [\n  {\n    settings: {\n      seatbelt: {\n        keepRules: require(\'./eslint-typed.config.js\').flatMap(config => Object.keys(config.rules ?? {})),\n      }\n    },\n    rules: {\n      "no-unused-vars": "error",\n    },\n  }\n]\n\n// Typechecking-required ESLint config for CI\nmodule.exports = [\n  {\n    settings: {\n      seatbelt: {\n        keepRules: require(\'./eslint.config.js\').flatMap(config => Object.keys(config.rules ?? {})),\n      }\n    },\n    rules: {\n      // Requires typechecking (slow)\n      "@typescript-eslint/no-floating-promises": "error",\n    },\n  }\n]\n```\n\nYou can also set this with environment variable `SEATBELT_KEEP`:\n\n```bash\nSEATBELT_KEEP="@typescript-eslint/no-floating-promises',
      anyOf: [
        {
          type: "array",
          items: {
            type: "string",
          },
        },
        {
          const: "all",
          type: "string",
        },
      ],
    },
    allowIncreaseRules: {
      description:
        'When you enable a rule for the first time, lint with it in this set to set\nthe initial max error counts.\n\nTypically this should be enabled for one lint run only via an environment\nvariable, but it can also be configured via ESLint settings.\n\n```bash\nSEATBELT_INCREASE="@typescript-eslint/no-floating-promises" eslint\n```\n\nYou can set this to `"ALL"` to enable this setting for ALL rules:\n\n```bash\nSEATBELT_INCREASE=ALL eslint\n```\n\n```js\n// in eslint.config.js\n// maybe you have a use-case for this\nconst config = [\n  {\n    settings: {\n      seatbelt: {\n        allowIncreaseRules: ["@typescript-eslint/no-floating-promises"],\n      }\n    }\n  }\n]\n```',
      anyOf: [
        {
          type: "array",
          items: {
            type: "string",
          },
        },
        {
          const: "all",
          type: "string",
        },
      ],
    },
    frozen: {
      description:
        "Error if there is any change in the number of errors in the seatbelt file.\nThis is useful in CI to ensures that developers keep the seatbelt file up-to-date as they fix errors.\n\nIt is enabled by default when environment variable `CI` is set.\n\n```bash\nCI=1 eslint\n```\n\nThis can be set with the `SEATBELT_FROZEN` environment variable.\n\n```bash\nSEATBELT_FROZEN=1 eslint\n```\n\nOr in ESLint config:\n\n```js\n// in eslint.config.js\nconst config = [\n  {\n    settings: {\n      seatbelt: {\n        frozen: true,\n      }\n    }\n  }\n]\n```",
      type: "boolean",
    },
    disable: {
      description:
        "Completely disable seatbelt error processing for a lint run while leaving it otherwise configured.\n\nThis can be set with the `SEATBELT_DISABLE` environment variable.\n\n```bash\nSEATBELT_DISABLE=1 eslint\n```\n\nOr in ESLint config:\n\n```js\n// in eslint.config.js\nconst config = [\n  {\n    settings: {\n      seatbelt: {\n        disable: true,\n      }\n    }\n  }\n]\n```",
      type: "boolean",
    },
    disableInEditor: {
      description:
        "Use this in your IDE config to block seatbelt from automatically updating\nthe exceptions file when eslint is running during the `onType` event.",
      type: "boolean",
    },
    threadsafe: {
      description:
        "By default seatbelt assumes that only one ESLint process will read and\nwrite to the seatbelt file at a time.\n\nThis should be set to `true` if you use a parallel ESLint runner similar to\njest-runner-eslint to avoid losing updates during parallel writes to the\nseatbelt file.\n\nWhen enabled, seatbelt creates temporary lock files to serialize updates to\nthe seatbelt file. This comes at a small performance cost.\n\nThis is enabled by default when run with Jest (environment variable `JEST_WORKER_ID` is set).\n\nIt can also be set with environment variable `SEATBELT_THREADSAFE`:\n\n```bash\nSEATBELT_THREADSAFE=1 eslint-parallel\n```\n\nOr in ESLint config:\n\n```js\n// in eslint.config.js\nconst config = [\n  {\n    settings: {\n      seatbelt: {\n        threadsafe: true,\n      }\n    }\n  }\n]\n```",
      type: "boolean",
    },
    verbose: {
      description:
        "Enable verbose logging.\n\nThis can be set with the `SEATBELT_VERBOSE` environment variable.\n\n```bash\nSEATBELT_VERBOSE=1 eslint\n```\n\nOr in ESLint config:\n\n```js\n// in eslint.config.js\nconst config = [\n  {\n    settings: {\n      seatbelt: {\n        verbose: true,\n      }\n    }\n  }\n]\n```\n\nIf set to a function (like `console.error`), that function will be called with the log messages.\nThe default logger when set to `true` is `console.error`.",
      anyOf: [
        {
          enum: [false, "stderr", "stdout", true],
        },
        {
          type: "object",
        },
      ],
    },
    root: {
      description:
        "Repository or project root.\nBy default this is inferred from `seatbeltFile` by checking ancestor directories for `.git`.\nUsed for editor integration to disable seatbelt during git actions like rebase or merge.\n\nThis can be set with the `SEATBELT_ROOT` environment variable.",
      type: "string",
    },
  },
  $schema: "http://json-schema.org/draft-07/schema#",
} satisfies Schema
