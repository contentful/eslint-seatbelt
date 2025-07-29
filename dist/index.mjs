import {
  SeatbeltFile,
  appendErrorContext
} from "./chunk-QC7OVVMO.mjs";
import {
  SEATBELT_FROZEN,
  SEATBELT_INCREASE,
  SeatbeltArgs,
  SeatbeltConfig,
  SeatbeltConfigSchema,
  formatFilename,
  formatRuleId,
  logStderr,
  name,
  package_default,
  padVarName
} from "./chunk-WPM7GDSZ.mjs";

// src/pluginGlobals.ts
var ANY_CONFIG_DISABLED = false;
var LAST_VERBOSE_ARGS;
var VERBOSE_SEATBELT_FILES = /* @__PURE__ */ new Set();
var CLI_ARGS = /* @__PURE__ */ new Set();
var EMPTY_CONFIG = {};
var argsCache = /* @__PURE__ */ new WeakMap();
var seatbeltFileCache = /* @__PURE__ */ new Map();
var mergedConfigCache = /* @__PURE__ */ new WeakMap();
var envFallbackConfig;
var envOverrideConfig;
var hasAnyEnvVars = false;
var lastLintedFile;
var temporaryFileArgs = /* @__PURE__ */ new Map();
function getProcessEnvFallbackConfig() {
  if (!envFallbackConfig) {
    envFallbackConfig = SeatbeltConfig.fromFallbackEnv(
      process.env
    );
    hasAnyEnvVars = Object.keys(envFallbackConfig).length > 0;
  }
  return envFallbackConfig;
}
function getProcessEnvOverrideConfig() {
  if (!envOverrideConfig) {
    envOverrideConfig = SeatbeltConfig.fromEnvOverrides(
      process.env
    );
    ANY_CONFIG_DISABLED ||= envOverrideConfig.disable ?? false;
    hasAnyEnvVars = Object.keys(envOverrideConfig).length > 0;
  }
  return envOverrideConfig;
}
function ruleOverrideConfigToArgs(settingsConfig, ruleOverrideConfig) {
  if (settingsConfig && ruleOverrideConfig) {
    let settingsConfigMergeMap = mergedConfigCache.get(settingsConfig);
    if (!settingsConfigMergeMap) {
      settingsConfigMergeMap = /* @__PURE__ */ new WeakMap();
      mergedConfigCache.set(settingsConfig, settingsConfigMergeMap);
    }
    let mergedConfig = settingsConfigMergeMap.get(ruleOverrideConfig);
    if (!mergedConfig) {
      mergedConfig = { ...settingsConfig, ...ruleOverrideConfig };
      settingsConfigMergeMap.set(ruleOverrideConfig, mergedConfig);
    }
    return configToArgs(mergedConfig);
  }
  return configToArgs(ruleOverrideConfig ?? settingsConfig ?? EMPTY_CONFIG);
}
function configToArgs(config) {
  let args = argsCache.get(config);
  if (!args) {
    const compiledConfig = {
      ...getProcessEnvFallbackConfig(),
      ...config,
      ...getProcessEnvOverrideConfig()
    };
    args = SeatbeltArgs.fromConfig(compiledConfig);
    ANY_CONFIG_DISABLED ||= args.disable;
    if (args.verbose) {
      LAST_VERBOSE_ARGS = args;
      VERBOSE_SEATBELT_FILES.add(args.seatbeltFile);
      if (!args.disable) {
        logConfig(args, config);
      }
    }
    argsCache.set(config, args);
  }
  return args;
}
var configureRuleName = `${name}/configure`;
function logRuleSetupHint() {
  logStderr(
    `
Make sure you have rule ${configureRuleName} enabled in your ESLint config for all files:

  rules: {
    // ...
    "${configureRuleName}": "error",
  }

Docs: https://github.com/justjake/${name}#setup`
  );
}
function logConfig(args, baseConfig) {
  const log = SeatbeltArgs.getLogger(args);
  SeatbeltConfig.fromFallbackEnv(process.env, log);
  for (const [key, value] of Object.entries(baseConfig)) {
    log(`${padVarName("ESLint settings")} config.${key} =`, value);
  }
  SeatbeltConfig.fromEnvOverrides(process.env, log);
}
function pushFileArgs(filename, args) {
  lastLintedFile = { filename, args };
  temporaryFileArgs.set(filename, args);
  if (isEslintCli()) {
    CLI_ARGS.add(args);
  }
}
function popFileArgs(filename) {
  const args = temporaryFileArgs.get(filename);
  temporaryFileArgs.delete(filename);
  if (args) {
    return args;
  }
  if (lastLintedFile?.filename === filename) {
    return lastLintedFile.args;
  }
  if (!hasAnyEnvVars) {
    if (lastLintedFile) {
      logStderr(
        `WARNING: last configured by file \`${lastLintedFile.filename}\` but linting file \`${filename}\`.
You may have rule ${configureRuleName} enabled for some files, but not this one.
`.trim()
      );
    } else {
      logStderr(
        `WARNING: rule ${configureRuleName} not enabled in ESLint config and no SEATBELT environment variables set`
      );
    }
    logRuleSetupHint();
  }
  return configToArgs(EMPTY_CONFIG);
}
function getSeatbeltFile(filename) {
  let seatbeltFile = seatbeltFileCache.get(filename);
  if (!seatbeltFile) {
    seatbeltFile = SeatbeltFile.openSync(filename);
    seatbeltFileCache.set(filename, seatbeltFile);
  }
  return seatbeltFile;
}
function detectRunContext() {
  const isVscodeExtension = Boolean(process.env.VSCODE_IPC_HOOK);
  const isVscodeShell = process.env.TERM_PROGRAM === "vscode";
  const isEslintCli2 = process.argv.some(
    (arg) => arg.endsWith("bin/eslint.js") || arg.includes("node_modules/eslint/")
  );
  return {
    runner: isVscodeExtension ? "editor" : isEslintCli2 ? "eslint-cli" : "unknown",
    inEditorTerminal: isVscodeShell,
    npmLifecycleScript: process.env.npm_lifecycle_script,
    ci: Boolean(process.env.CI)
  };
}
var runContext;
function getRunContext() {
  if (!runContext) {
    runContext = detectRunContext();
  }
  return runContext;
}
var pluginStats = {
  processorRuns: 0,
  ruleRuns: 0,
  removedFiles: 0
};
function incrementStat(key, value = 1) {
  pluginStats[key] += value;
}
function onPreprocess(_filename) {
  incrementStat("processorRuns");
}
function onPostprocess(_filename) {
}
function onConfigureRule(_filename) {
  incrementStat("ruleRuns");
}
function isEslintCli() {
  return getRunContext().runner === "eslint-cli";
}

// src/SeatbeltProcessor.ts
var { name: name2, version: version2 } = package_default;
var SeatbeltProcessor = {
  supportsAutofix: true,
  meta: {
    name: name2,
    version: version2
  },
  // takes text of the file and filename
  preprocess(text, filename) {
    onPreprocess(filename);
    return [text];
  },
  /** Where the action happens. */
  postprocess(messagesPerSection, filename) {
    onPostprocess(filename);
    if (messagesPerSection.length !== 1) {
      throw new Error(
        `${name2} bug: expected preprocess to return 1 section, got ${messagesPerSection.length}`
      );
    }
    const messages = messagesPerSection[0];
    const args = popFileArgs(filename);
    if (args.disable) {
      return messages;
    }
    const seatbeltFile = getSeatbeltFile(args.seatbeltFile);
    if (args.threadsafe || !isEslintCli()) {
      seatbeltFile.readSync();
    }
    const ruleToErrorCount = countRuleIds(messages);
    const verboseOnce = args.verbose ? createOnce() : () => false;
    try {
      const transformed = transformMessages(
        args,
        seatbeltFile,
        filename,
        messages,
        ruleToErrorCount,
        verboseOnce
      );
      try {
        const additionalMessages = maybeWriteStateUpdate(
          args,
          seatbeltFile,
          filename,
          ruleToErrorCount
        );
        if (additionalMessages) {
          return transformed.concat(additionalMessages);
        } else {
          return transformed;
        }
      } catch (e) {
        return [...transformed, handleProcessingError(filename, e)];
      }
    } catch (e) {
      return [...messages, handleProcessingError(filename, e)];
    }
  }
};
function createOnce() {
  const seen = /* @__PURE__ */ new Set();
  return (value) => {
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  };
}
function transformMessages(args, seatbeltFile, filename, messages, ruleToErrorCount, verboseOnce) {
  if (args.disable) {
    return messages;
  }
  const ruleToMaxErrorCount = seatbeltFile.getMaxErrors(filename);
  const allowIncrease = args.allowIncreaseRules === "all" || args.allowIncreaseRules.size > 0;
  if (!ruleToMaxErrorCount && !allowIncrease) {
    return messages;
  }
  return messages.map((message) => {
    if (message.ruleId === null) {
      SeatbeltArgs.verboseLog(
        args,
        () => `${formatFilename(filename)}:${message.line}:${message.column}: cannot transform message with null ruleId`
      );
      return message;
    }
    if (!isCountableLintError(message)) {
      return message;
    }
    const errorCount = ruleToErrorCount.get(message.ruleId);
    if (errorCount === void 0) {
      throw new Error(
        `${name2} bug: errorCount not found for rule ${message.ruleId}`
      );
    }
    const maxErrorCount = ruleToMaxErrorCount?.get(message.ruleId) ?? 0;
    const allowIncrease2 = SeatbeltArgs.ruleSetHas(
      args.allowIncreaseRules,
      message.ruleId
    );
    if (maxErrorCount === 0 && !allowIncrease2) {
      return message;
    } else if (errorCount > maxErrorCount) {
      if (allowIncrease2) {
        return messageOverMaxErrorCountButIncreaseAllowed(
          message,
          errorCount,
          maxErrorCount
        );
      }
      if (verboseOnce(message.ruleId)) {
        SeatbeltArgs.verboseLog(
          args,
          () => `${formatFilename(filename)}: ${formatRuleId(message.ruleId)}: error: ${errorCount} ${pluralErrors(errorCount)} found > max ${maxErrorCount}`
        );
      }
      return messageOverMaxErrorCount(message, errorCount, maxErrorCount);
    } else if (errorCount === maxErrorCount) {
      if (verboseOnce(message.ruleId)) {
        SeatbeltArgs.verboseLog(
          args,
          () => `${formatFilename(filename)}: ${formatRuleId(message.ruleId)}: ok: ${errorCount} ${pluralErrors(errorCount)} found == max ${maxErrorCount}`
        );
      }
      return messageAtMaxErrorCount(message, errorCount);
    } else {
      if (args.frozen) {
        return messageFrozenUnderMaxErrorCount(
          message,
          filename,
          errorCount,
          maxErrorCount
        );
      }
      return messageUnderMaxErrorCount(message, errorCount, maxErrorCount);
    }
  });
}
function isCountableLintError(message) {
  if (!message.severity || message.severity < 2) {
    return false;
  }
  if ("suppressions" in message && message.suppressions.length > 0) {
    return false;
  }
  if (!message.ruleId) {
    return false;
  }
  return true;
}
function countRuleIds(messages) {
  const ruleToErrorCount = /* @__PURE__ */ new Map();
  messages.forEach((message) => {
    if (!isCountableLintError(message)) {
      return;
    }
    ruleToErrorCount.set(
      message.ruleId,
      (ruleToErrorCount.get(message.ruleId) ?? 0) + 1
    );
  });
  return ruleToErrorCount;
}
function maybeWriteStateUpdate(args, stateFile, filename, ruleToErrorCount) {
  if (args.disable) {
    return;
  }
  if (args.disableInEditor) {
    return;
  }
  if (args.threadsafe) {
    stateFile.readSync();
  }
  const ruleToMaxErrorCount = stateFile.getMaxErrors(filename);
  const { removedRules } = stateFile.updateMaxErrors(
    filename,
    args,
    ruleToErrorCount
  );
  if (!args.frozen) {
    stateFile.flushChanges();
  } else if (removedRules && removedRules.size > 0) {
    return Array.from(removedRules).map((ruleId) => {
      const maxErrorCount = ruleToMaxErrorCount?.get(ruleId);
      if (maxErrorCount === void 0) {
        throw new Error(
          `${name2} bug: maxErrorCount not found for removed frozen rule ${ruleId}`
        );
      }
      const message = {
        ruleId,
        column: 0,
        line: 1,
        severity: 2,
        message: messageFrozenUnderMaxErrorCountText(
          filename,
          0,
          maxErrorCount
        )
      };
      return message;
    });
  }
}
function messageOverMaxErrorCount(message, errorCount, maxErrorCount) {
  return {
    ...message,
    message: `${message.message}
[${name2}]: There are ${errorCount} ${pluralErrors(errorCount)} of this type, but only ${maxErrorCount} are allowed.
Remove ${errorCount - maxErrorCount} to turn these errors into warnings.
    `.trim()
  };
}
function messageOverMaxErrorCountButIncreaseAllowed(message, errorCount, maxErrorCount) {
  const increaseCount = errorCount - maxErrorCount;
  return {
    ...message,
    severity: 1,
    message: `${message.message}
[${name2}]: ${SEATBELT_INCREASE}: Temporarily allowing ${increaseCount} new ${pluralErrors(increaseCount)} of this type.
    `.trim()
  };
}
function messageAtMaxErrorCount(message, errorCount) {
  return {
    ...message,
    severity: 1,
    message: `${message.message}
[${name2}]: This file is temporarily allowed to have ${errorCount} ${pluralErrors(errorCount)} of this type.
Please tend the garden by fixing if you have the time.
    `.trim()
  };
}
function messageUnderMaxErrorCount(message, errorCount, maxErrorCount) {
  const fixed = errorCount - maxErrorCount;
  const fixedMessage = fixed === 1 ? "one" : `${fixed} errors`;
  return {
    ...message,
    severity: 1,
    message: `${message.message}
[${name2}]: This file is temporarily allowed to have ${maxErrorCount} ${pluralErrors(maxErrorCount)} of this type.
Thank you for fixing ${fixedMessage}, it really helps.
    `.trim()
  };
}
function messageFrozenUnderMaxErrorCountText(seatbeltFilename, errorCount, maxErrorCount) {
  const fixed = errorCount - maxErrorCount;
  const fixedMessage = fixed === 1 ? "error" : "errors";
  return `
[${name2}]: ${SEATBELT_FROZEN}: Expected ${maxErrorCount} ${pluralErrors(maxErrorCount)}, found ${errorCount}.
If you fixed ${fixed} ${fixedMessage}, thank you, but you'll need to update the seatbelt file to match.
Try running eslint, then committing ${seatbeltFilename}.
`.trim();
}
function messageFrozenUnderMaxErrorCount(message, seatbeltFilename, errorCount, maxErrorCount) {
  return {
    ...message,
    severity: 1,
    message: `${message.message}
${messageFrozenUnderMaxErrorCountText(seatbeltFilename, errorCount, maxErrorCount)}`
  };
}
var alreadyModifiedError = /* @__PURE__ */ new WeakSet();
function handleProcessingError(filename, e) {
  if (e instanceof Error && !alreadyModifiedError.has(e)) {
    alreadyModifiedError.add(e);
    appendErrorContext(e, `while processing \`${filename}\``);
    appendErrorContext(
      e,
      `this may be a bug in ${name2}@${version2} or a problem with your setup`
    );
  }
  throw e;
}
function pluralErrors(count) {
  return count === 1 ? "error" : "errors";
}

// src/rules/configure.ts
var configure = {
  meta: {
    docs: {
      description: `Applies ${name} configuration from ESLint config`,
      url: `https://github.com/justjake/${name}`
    },
    schema: [SeatbeltConfigSchema]
  },
  create(context) {
    const filename = context.getFilename?.() ?? context.filename;
    onConfigureRule(filename);
    const eslintSharedConfigViaShortName = context.settings?.seatbelt;
    const eslintSharedConfigViaPackageName = context.settings?.[name];
    const eslintSharedConfig = eslintSharedConfigViaShortName ?? eslintSharedConfigViaPackageName;
    const fileOverrideConfig = context.options[0];
    const args = ruleOverrideConfigToArgs(
      eslintSharedConfig,
      fileOverrideConfig
    );
    pushFileArgs(filename, args);
    return {};
  }
};

// src/index.ts
var { name: name3, version: version3 } = package_default;
var plugin = {
  meta: {
    name: name3,
    version: version3
  },
  /**
   * https://eslint.org/docs/latest/extend/custom-processors
   */
  processors: {
    seatbelt: SeatbeltProcessor
  },
  rules: {
    configure
  },
  /**
   *
   */
  configs: {
    /**
     * Config preset for ESLint 9 and above.
     *
     * Usage:
     *
     * ```
     * // eslint.config.js
     * module.exports = [
     *   require("eslint-seatbelt").configs.enable,
     *   // ... your configs
     * ]
     */
    enable: void 0,
    /**
     * Config preset for ESLint 8 and below.
     *
     * Usage:
     *
     * ```
     * // eslintrc.js
     * module.exports = {
     *   plugins: ["eslint-seatbelt"],
     *   extends: ["plugin:eslint-seatbelt/enable-legacy"],
     *   // ... your configs
     * }
     * ```
     *
     * https://eslint.org/docs/latest/use/configure/configuration-files-deprecated#using-a-configuration-from-a-plugin
     */
    "enable-legacy": void 0
  }
};
plugin.configs.enable = createESLint9Config();
plugin.configs["enable-legacy"] = createLegacyConfig();
function createESLint9Config() {
  const ownPlugin = plugin;
  return {
    name: `${name3}/enable`,
    plugins: {
      [name3]: ownPlugin
    },
    rules: {
      [`${name3}/configure`]: "error"
    },
    processor: `${name3}/seatbelt`
  };
}
function createLegacyConfig() {
  return {
    plugins: [name3],
    rules: {
      [`${name3}/configure`]: "error"
    },
    processor: `${name3}/seatbelt`
  };
}
var src_default = plugin;
export {
  src_default as default
};
//# sourceMappingURL=index.mjs.map