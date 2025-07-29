var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// package.json
var name = "eslint-seatbelt";
var version = "0.1.1";
var package_default = {
  name,
  version,
  description: "Gradually tighten ESLint rules in your codebase",
  keywords: [
    "eslint",
    "incremental",
    "gradual",
    "workflow",
    "processor",
    "linting"
  ],
  author: {
    name: "Jake Teton-Landis",
    url: "https://jake.tl"
  },
  repository: {
    type: "git",
    url: "git+https://github.com/justjake/eslint-seatbelt.git"
  },
  bugs: {
    url: "https://github.com/justjake/eslint-seatbelt/issues"
  },
  scripts: {
    prepare: "npm run build",
    build: "./scripts/make-json-schemas.ts && tsc && tsup",
    test: "node --test --require tsx/cjs $(find src -name '*.test.ts')",
    lint: "pnpm build && NODE_OPTIONS='--enable-source-maps' eslint ."
  },
  types: "dist/index.d.ts",
  import: "./dist/index.mjs",
  main: "dist/index.js",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      import: "./dist/index.mjs",
      default: "./dist/index.js"
    },
    "./api": {
      types: "./dist/api.d.ts",
      import: "./dist/api.mjs",
      default: "./dist/api.js"
    }
  },
  bin: {
    "eslint-seatbelt": "./dist/command.js"
  },
  files: [
    "!*.tsbuildinfo",
    "!src/**/*.test.ts",
    "src",
    "dist"
  ],
  license: "MIT",
  peerDependencies: {
    "@types/eslint": "*",
    eslint: "*"
  },
  peerDependenciesMeta: {
    eslint: {
      optional: true
    },
    "@types/eslint": {
      optional: true
    }
  },
  devDependencies: {
    "@eslint/compat": "1.2.3",
    "@eslint/js": "9.15.0",
    "@types/eslint__js": "8.42.3",
    "@types/node": "22.9.0",
    "@typescript-eslint/rule-tester": "8.14.0",
    "@typescript-eslint/utils": "8.14.0",
    eslint: "9.14.0",
    prettier: "3.3.3",
    tsup: "8.3.5",
    tsx: "4.19.2",
    typescript: "5.6.3",
    "typescript-eslint": "8.14.0",
    "typescript-json-schema": "0.65.1"
  },
  dependencies: {
    "ts-command-line-args": "^2.5.1"
  },
  packageManager: "pnpm@10.2.1+sha1.48adf39a4ab751eda7b73b99447d1f0b6d227e02"
};

// src/SeatbeltConfig.ts
import path from "node:path";

// src/repoIntegration.ts
import fs from "node:fs";
import nodePath from "node:path";
function findAncestorDirectory(path2, predicate) {
  let lastPath = void 0;
  while (path2 !== lastPath) {
    if (predicate(path2)) {
      return path2;
    }
    lastPath = path2;
    path2 = nodePath.dirname(path2);
  }
}
function isGitRoot(dir) {
  return fs.existsSync(nodePath.join(dir, ".git"));
}
function findRepoRoot(path2) {
  return findAncestorDirectory(path2, isGitRoot);
}

// src/SeatbeltConfig.ts
var SEATBELT_FILE_NAME = "eslint.seatbelt.tsv";
var SEATBELT_FROZEN = "SEATBELT_FROZEN";
var SEATBELT_INCREASE = "SEATBELT_INCREASE";
var SEATBELT_KEEP = "SEATBELT_KEEP";
var SEATBELT_FILE = "SEATBELT_FILE";
var SEATBELT_PWD = "SEATBELT_PWD";
var SEATBELT_DISABLE = "SEATBELT_DISABLE";
var SEATBELT_DISABLE_IN_EDITOR = "SEATBELT_DISABLE_IN_EDITOR";
var SEATBELT_THREADSAFE = "SEATBELT_THREADSAFE";
var SEATBELT_VERBOSE = "SEATBELT_VERBOSE";
var SEATBELT_ROOT = "SEATBELT_ROOT";
var ENV_VARS = {
  SEATBELT_FROZEN,
  SEATBELT_INCREASE,
  SEATBELT_KEEP,
  SEATBELT_FILE,
  SEATBELT_PWD,
  SEATBELT_DISABLE,
  SEATBELT_DISABLE_IN_EDITOR,
  SEATBELT_THREADSAFE,
  SEATBELT_VERBOSE,
  SEATBELT_ROOT,
  CI: "CI",
  JEST_WORKER_ID: "JEST_WORKER_ID"
};
var SeatbeltConfig = {
  withEnvOverrides(config, env) {
    return {
      ...SeatbeltConfig.fromFallbackEnv(env),
      ...config,
      ...SeatbeltConfig.fromEnvOverrides(env)
    };
  },
  fromFallbackEnv(env, log) {
    const config = {};
    const isCI = SeatbeltEnv.readBooleanEnvVar(env.CI);
    if (isCI) {
      config.frozen = true;
      log?.(`${padVarName("CI")} config.frozen defaults to`, true);
    }
    if (env.JEST_WORKER_ID) {
      config.threadsafe = true;
      log?.(
        `${padVarName("JEST_WORKER_ID")} config.threadsafe defaults to`,
        true
      );
    }
    return config;
  },
  fromEnvOverrides(env, log) {
    const config = {
      pwd: env[SEATBELT_PWD] || process.cwd()
    };
    const verbose = SeatbeltEnv.readBooleanEnvVar(env[SEATBELT_VERBOSE]);
    if (verbose !== void 0) {
      config.verbose = verbose;
      log?.(`${padVarName(SEATBELT_VERBOSE)} config.verbose =`, verbose);
    }
    const seatbeltFile = env[SEATBELT_FILE];
    if (seatbeltFile) {
      const rootRelative = path.isAbsolute(seatbeltFile) ? seatbeltFile : path.join(config.pwd, seatbeltFile);
      config.seatbeltFile = rootRelative;
      log?.(`${padVarName(SEATBELT_FILE)} config.seatbeltFile =`, rootRelative);
    }
    const disable = SeatbeltEnv.readBooleanEnvVar(env[SEATBELT_DISABLE]);
    if (disable !== void 0) {
      config.disable = disable;
      log?.(`${padVarName(SEATBELT_DISABLE)} config.disable =`, disable);
    }
    const disableInEditor = SeatbeltEnv.readBooleanEnvVar(env[SEATBELT_DISABLE_IN_EDITOR]);
    if (disableInEditor !== void 0) {
      config.disableInEditor = disableInEditor;
      log?.(`${padVarName(SEATBELT_DISABLE_IN_EDITOR)} config.disableInEditor =`, disableInEditor);
    }
    const frozen = SeatbeltEnv.readBooleanEnvVar(env[SEATBELT_FROZEN]);
    if (frozen !== void 0) {
      config.frozen = frozen;
      log?.(`${padVarName(SEATBELT_FROZEN)} config.frozen =`, frozen);
    }
    const increase = SeatbeltEnv.parseRuleSetEnvVar(env[SEATBELT_INCREASE]);
    if (increase !== void 0) {
      config.allowIncreaseRules = increase;
      log?.(
        `${padVarName(SEATBELT_INCREASE)} config.allowIncreaseRules =`,
        increase
      );
    }
    const keep = SeatbeltEnv.parseRuleSetEnvVar(env[SEATBELT_KEEP]);
    if (keep !== void 0) {
      config.keepRules = keep;
      log?.(`${padVarName(SEATBELT_KEEP)} config.keepRules =`, keep);
    }
    const threadsafe = SeatbeltEnv.readBooleanEnvVar(env[SEATBELT_THREADSAFE]);
    if (threadsafe !== void 0) {
      config.threadsafe = threadsafe;
      log?.(
        `${padVarName(SEATBELT_THREADSAFE)} config.threadsafe =`,
        threadsafe
      );
    }
    const root = env[SEATBELT_ROOT];
    if (root) {
      config.root = root;
      log?.(`${padVarName(SEATBELT_ROOT)} config.root =`, root);
    }
    return config;
  }
};
var SeatbeltEnv = {
  parseRuleSetEnvVar(value) {
    if (value === void 0) {
      return void 0;
    }
    if (!value) {
      return [];
    }
    const lower = value.toLowerCase();
    if (lower === "all" || lower === "1" || lower === "true") {
      return "all";
    }
    return value.split(/[\s,]+/g).filter(Boolean);
  },
  readBooleanEnvVar(value) {
    if (value === void 0 || value === "") {
      return void 0;
    }
    const lower = value.toLowerCase();
    if (lower === "false" || lower === "0" || lower === "no") {
      return false;
    }
    return Boolean(value);
  }
};
var logStdout = (...message) => (
  // eslint-disable-next-line no-console
  console.log(`[${name}]:`, ...message)
);
var logStderr = (...message) => (
  // eslint-disable-next-line no-console
  console.error(`[${name}]:`, ...message)
);
var SeatbeltArgs = {
  fromConfig(config) {
    const cwd = config.pwd ?? process.cwd();
    const seatbeltFile = config.seatbeltFile ?? SeatbeltArgs.findSeatbeltFile(cwd);
    const root = config.root ?? findRepoRoot(seatbeltFile) ?? path.dirname(seatbeltFile);
    return {
      seatbeltFile,
      root,
      keepRules: typeof config.keepRules === "string" ? config.keepRules : new Set(config.keepRules ?? []),
      allowIncreaseRules: typeof config.allowIncreaseRules === "string" ? config.allowIncreaseRules : new Set(config.allowIncreaseRules ?? []),
      frozen: config.frozen ?? false,
      disable: config.disable ?? false,
      disableInEditor: config.disableInEditor ?? false,
      threadsafe: config.threadsafe ?? false,
      verbose: config.verbose ?? false
    };
  },
  getLogger(args) {
    if (typeof args.verbose === "function") {
      return args.verbose;
    }
    if (args.verbose === "stdout") {
      return logStdout;
    }
    return logStderr;
  },
  ruleSetHas(ruleSet, ruleId) {
    return ruleSet === "all" || ruleSet.has(ruleId);
  },
  verboseLog(args, makeMessage) {
    if (args.verbose) {
      const message = makeMessage();
      const log = SeatbeltArgs.getLogger(args);
      if (typeof message === "string") {
        log(message);
      } else {
        log(...message);
      }
    }
  },
  findSeatbeltFile(cwd) {
    return `${cwd}/${SEATBELT_FILE_NAME}`;
  }
};
var envVarMaxLength = 0;
function padVarName(name2) {
  envVarMaxLength ||= Math.max(
    ...Object.values(ENV_VARS).map((name3) => name3.length)
  );
  return `${name2}:`.padEnd(envVarMaxLength + 1);
}
function formatFilename(filename) {
  const relative = path.relative(
    process.env[SEATBELT_PWD] ?? process.cwd(),
    filename
  );
  return relative ? relative : filename;
}
function formatRuleId(ruleId) {
  if (ruleId === null) {
    return `unknown rule`;
  }
  return `rule ${ruleId}`;
}

// src/jsonSchema/SeatbeltConfigSchema.ts
var SeatbeltConfigSchema = {
  description: 'Configuration for seatbelt can be provided in a few ways:\n\n1. Defined in the shared `settings` object in your ESLint config. This\n   requires also configuring the `eslint-seatbelt/configure` rule.\n\n    ```js\n    // in eslint.config.js\n    const config = [\n      {\n        settings: {\n          seatbelt: {\n            // ...\n          }\n        },\n        rules: {\n          "eslint-seatbelt/configure": "error",\n        }\n      }\n    ]\n    ```\n\n2. Using the `eslint-seatbelt/configure` rule in your ESLint config.\n   This can be used to override settings for specific files in legacy ESLint configs.\n   Any configuration provided here will override the shared `settings` object.\n\n    ```js\n    // in .eslintrc.js\n    module.exports = {\n      rules: {\n        "eslint-seatbelt/configure": "error",\n      },\n      overrides: [\n        {\n          files: ["some/path/*"],\n          rules: {\n            "eslint-seatbelt/configure": ["error", { seatbeltFile: "some/path/eslint.seatbelt.tsv" }]\n          },\n        },\n      ],\n    }\n    ```\n3. The settings in config files can be overridden with environment variables when running `eslint` or other tools.\n\n   ```bash\n   SEATBELT_FILE=some/path/eslint.seatbelt.tsv SEATBELT_FROZEN=1 eslint\n   ```',
  type: "object",
  properties: {
    seatbeltFile: {
      description: "The seatbelt file stores the max error counts allowed for each file. Should\nbe an absolute path.\n\nIf not provided, $SEATBELT_PWD/eslint.seatbelt.tsv or $PWD/eslint.seatbelt.tsv will be used.\n\n```js\n// in eslint.config.js\nconst config = [\n  {\n    settings: {\n      seatbelt: {\n        // commonjs\n        seatbeltFile: `${__dirname}/eslint.seatbelt.tsv`\n        // esm\n        seatbeltFile: new URL('./eslint.seatbelt.tsv', import.meta.url).pathname\n      }\n    }\n  }\n]\n```\n\nYou can also set this with environment variable `SEATBELT_FILE`:\n\n```bash\nSEATBELT_FILE=.config/custom-seatbelt-file eslint\n```",
      type: "string"
    },
    keepRules: {
      description: 'By default whenever a file is linted and a rule has no errors, that rule\'s\nmax errors for the file is set to zero.\n\nHowever with typescript-eslint, it can be helpful to have two ESLint configs:\n\n- A default ESLint config with only syntactic rules enabled that don\'t\n  require typechecking, that runs on developer machines and in their editor.\n- A CI-only ESLint config with only type-aware rules enabled that requires\n  typechecking. Since these rules require typechecking, they can be too\n  slow to run in interactive contexts.\n\nTo avoid this, set `keepRules` to the names of *disabled but known rules*\nwhile linting.\n\nExample:\n\n```js\n// Default ESLint config\nmodule.exports = [\n  {\n    settings: {\n      seatbelt: {\n        keepRules: require(\'./eslint-typed.config.js\').flatMap(config => Object.keys(config.rules ?? {})),\n      }\n    },\n    rules: {\n      "no-unused-vars": "error",\n    },\n  }\n]\n\n// Typechecking-required ESLint config for CI\nmodule.exports = [\n  {\n    settings: {\n      seatbelt: {\n        keepRules: require(\'./eslint.config.js\').flatMap(config => Object.keys(config.rules ?? {})),\n      }\n    },\n    rules: {\n      // Requires typechecking (slow)\n      "@typescript-eslint/no-floating-promises": "error",\n    },\n  }\n]\n```\n\nYou can also set this with environment variable `SEATBELT_KEEP`:\n\n```bash\nSEATBELT_KEEP="@typescript-eslint/no-floating-promises',
      anyOf: [
        {
          type: "array",
          items: {
            type: "string"
          }
        },
        {
          const: "all",
          type: "string"
        }
      ]
    },
    allowIncreaseRules: {
      description: 'When you enable a rule for the first time, lint with it in this set to set\nthe initial max error counts.\n\nTypically this should be enabled for one lint run only via an environment\nvariable, but it can also be configured via ESLint settings.\n\n```bash\nSEATBELT_INCREASE="@typescript-eslint/no-floating-promises" eslint\n```\n\nYou can set this to `"ALL"` to enable this setting for ALL rules:\n\n```bash\nSEATBELT_INCREASE=ALL eslint\n```\n\n```js\n// in eslint.config.js\n// maybe you have a use-case for this\nconst config = [\n  {\n    settings: {\n      seatbelt: {\n        allowIncreaseRules: ["@typescript-eslint/no-floating-promises"],\n      }\n    }\n  }\n]\n```',
      anyOf: [
        {
          type: "array",
          items: {
            type: "string"
          }
        },
        {
          const: "all",
          type: "string"
        }
      ]
    },
    frozen: {
      description: "Error if there is any change in the number of errors in the seatbelt file.\nThis is useful in CI to ensures that developers keep the seatbelt file up-to-date as they fix errors.\n\nIt is enabled by default when environment variable `CI` is set.\n\n```bash\nCI=1 eslint\n```\n\nThis can be set with the `SEATBELT_FROZEN` environment variable.\n\n```bash\nSEATBELT_FROZEN=1 eslint\n```\n\nOr in ESLint config:\n\n```js\n// in eslint.config.js\nconst config = [\n  {\n    settings: {\n      seatbelt: {\n        frozen: true,\n      }\n    }\n  }\n]\n```",
      type: "boolean"
    },
    disable: {
      description: "Completely disable seatbelt error processing for a lint run while leaving it otherwise configured.\n\nThis can be set with the `SEATBELT_DISABLE` environment variable.\n\n```bash\nSEATBELT_DISABLE=1 eslint\n```\n\nOr in ESLint config:\n\n```js\n// in eslint.config.js\nconst config = [\n  {\n    settings: {\n      seatbelt: {\n        disable: true,\n      }\n    }\n  }\n]\n```",
      type: "boolean"
    },
    disableInEditor: {
      description: "Use this in your IDE config to block seatbelt from automatically updating\nthe exceptions file when eslint is running during the `onType` event.",
      type: "boolean"
    },
    threadsafe: {
      description: "By default seatbelt assumes that only one ESLint process will read and\nwrite to the seatbelt file at a time.\n\nThis should be set to `true` if you use a parallel ESLint runner similar to\njest-runner-eslint to avoid losing updates during parallel writes to the\nseatbelt file.\n\nWhen enabled, seatbelt creates temporary lock files to serialize updates to\nthe seatbelt file. This comes at a small performance cost.\n\nThis is enabled by default when run with Jest (environment variable `JEST_WORKER_ID` is set).\n\nIt can also be set with environment variable `SEATBELT_THREADSAFE`:\n\n```bash\nSEATBELT_THREADSAFE=1 eslint-parallel\n```\n\nOr in ESLint config:\n\n```js\n// in eslint.config.js\nconst config = [\n  {\n    settings: {\n      seatbelt: {\n        threadsafe: true,\n      }\n    }\n  }\n]\n```",
      type: "boolean"
    },
    verbose: {
      description: "Enable verbose logging.\n\nThis can be set with the `SEATBELT_VERBOSE` environment variable.\n\n```bash\nSEATBELT_VERBOSE=1 eslint\n```\n\nOr in ESLint config:\n\n```js\n// in eslint.config.js\nconst config = [\n  {\n    settings: {\n      seatbelt: {\n        verbose: true,\n      }\n    }\n  }\n]\n```\n\nIf set to a function (like `console.error`), that function will be called with the log messages.\nThe default logger when set to `true` is `console.error`.",
      anyOf: [
        {
          enum: [false, "stderr", "stdout", true]
        },
        {
          type: "object"
        }
      ]
    },
    root: {
      description: "Repository or project root.\nBy default this is inferred from `seatbeltFile` by checking ancestor directories for `.git`.\nUsed for editor integration to disable seatbelt during git actions like rebase or merge.\n\nThis can be set with the `SEATBELT_ROOT` environment variable.",
      type: "string"
    }
  },
  $schema: "http://json-schema.org/draft-07/schema#"
};

export {
  __require,
  name,
  version,
  package_default,
  SEATBELT_FILE_NAME,
  SEATBELT_FROZEN,
  SEATBELT_INCREASE,
  SEATBELT_KEEP,
  SEATBELT_FILE,
  SEATBELT_PWD,
  SEATBELT_DISABLE,
  SEATBELT_DISABLE_IN_EDITOR,
  SEATBELT_THREADSAFE,
  SEATBELT_VERBOSE,
  SEATBELT_ROOT,
  SeatbeltConfig,
  SeatbeltEnv,
  logStdout,
  logStderr,
  SeatbeltArgs,
  padVarName,
  formatFilename,
  formatRuleId,
  SeatbeltConfigSchema
};
//# sourceMappingURL=chunk-WPM7GDSZ.mjs.map