"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }


var _chunkEVZG2A2Jjs = require('./chunk-EVZG2A2J.js');












var _chunkFQZOBLAEjs = require('./chunk-FQZOBLAE.js');

// src/pluginGlobals.ts
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
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
    envFallbackConfig = _chunkFQZOBLAEjs.SeatbeltConfig.fromFallbackEnv(
      process.env
    );
    hasAnyEnvVars = Object.keys(envFallbackConfig).length > 0;
  }
  return envFallbackConfig;
}
function getProcessEnvOverrideConfig() {
  if (!envOverrideConfig) {
    envOverrideConfig = _chunkFQZOBLAEjs.SeatbeltConfig.fromEnvOverrides(
      process.env
    );
    ANY_CONFIG_DISABLED ||= _nullishCoalesce(envOverrideConfig.disable, () => ( false));
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
  return configToArgs(_nullishCoalesce(_nullishCoalesce(ruleOverrideConfig, () => ( settingsConfig)), () => ( EMPTY_CONFIG)));
}
function configToArgs(config) {
  let args = argsCache.get(config);
  if (!args) {
    const compiledConfig = {
      ...getProcessEnvFallbackConfig(),
      ...config,
      ...getProcessEnvOverrideConfig()
    };
    args = _chunkFQZOBLAEjs.SeatbeltArgs.fromConfig(compiledConfig);
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
var configureRuleName = `${_chunkFQZOBLAEjs.name}/configure`;
function logRuleSetupHint() {
  _chunkFQZOBLAEjs.logStderr.call(void 0, 
    `
Make sure you have rule ${configureRuleName} enabled in your ESLint config for all files:

  rules: {
    // ...
    "${configureRuleName}": "error",
  }

Docs: https://github.com/justjake/${_chunkFQZOBLAEjs.name}#setup`
  );
}
function logConfig(args, baseConfig) {
  const log = _chunkFQZOBLAEjs.SeatbeltArgs.getLogger(args);
  _chunkFQZOBLAEjs.SeatbeltConfig.fromFallbackEnv(process.env, log);
  for (const [key, value] of Object.entries(baseConfig)) {
    log(`${_chunkFQZOBLAEjs.padVarName.call(void 0, "ESLint settings")} config.${key} =`, value);
  }
  _chunkFQZOBLAEjs.SeatbeltConfig.fromEnvOverrides(process.env, log);
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
  if (_optionalChain([lastLintedFile, 'optionalAccess', _ => _.filename]) === filename) {
    return lastLintedFile.args;
  }
  if (!hasAnyEnvVars) {
    if (lastLintedFile) {
      _chunkFQZOBLAEjs.logStderr.call(void 0, 
        `WARNING: last configured by file \`${lastLintedFile.filename}\` but linting file \`${filename}\`.
You may have rule ${configureRuleName} enabled for some files, but not this one.
`.trim()
      );
    } else {
      _chunkFQZOBLAEjs.logStderr.call(void 0, 
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
    seatbeltFile = _chunkEVZG2A2Jjs.SeatbeltFile.openSync(filename);
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
var { name: name2, version: version2 } = _chunkFQZOBLAEjs.package_default;
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
      _chunkFQZOBLAEjs.SeatbeltArgs.verboseLog(
        args,
        () => `${_chunkFQZOBLAEjs.formatFilename.call(void 0, filename)}:${message.line}:${message.column}: cannot transform message with null ruleId`
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
    const maxErrorCount = _nullishCoalesce(_optionalChain([ruleToMaxErrorCount, 'optionalAccess', _2 => _2.get, 'call', _3 => _3(message.ruleId)]), () => ( 0));
    const allowIncrease2 = _chunkFQZOBLAEjs.SeatbeltArgs.ruleSetHas(
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
        _chunkFQZOBLAEjs.SeatbeltArgs.verboseLog(
          args,
          () => `${_chunkFQZOBLAEjs.formatFilename.call(void 0, filename)}: ${_chunkFQZOBLAEjs.formatRuleId.call(void 0, message.ruleId)}: error: ${errorCount} ${pluralErrors(errorCount)} found > max ${maxErrorCount}`
        );
      }
      return messageOverMaxErrorCount(message, errorCount, maxErrorCount);
    } else if (errorCount === maxErrorCount) {
      if (verboseOnce(message.ruleId)) {
        _chunkFQZOBLAEjs.SeatbeltArgs.verboseLog(
          args,
          () => `${_chunkFQZOBLAEjs.formatFilename.call(void 0, filename)}: ${_chunkFQZOBLAEjs.formatRuleId.call(void 0, message.ruleId)}: ok: ${errorCount} ${pluralErrors(errorCount)} found == max ${maxErrorCount}`
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
      (_nullishCoalesce(ruleToErrorCount.get(message.ruleId), () => ( 0))) + 1
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
      const maxErrorCount = _optionalChain([ruleToMaxErrorCount, 'optionalAccess', _4 => _4.get, 'call', _5 => _5(ruleId)]);
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
[${name2}]: ${_chunkFQZOBLAEjs.SEATBELT_INCREASE}: Temporarily allowing ${increaseCount} new ${pluralErrors(increaseCount)} of this type.
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
[${name2}]: ${_chunkFQZOBLAEjs.SEATBELT_FROZEN}: Expected ${maxErrorCount} ${pluralErrors(maxErrorCount)}, found ${errorCount}.
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
    _chunkEVZG2A2Jjs.appendErrorContext.call(void 0, e, `while processing \`${filename}\``);
    _chunkEVZG2A2Jjs.appendErrorContext.call(void 0, 
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
      description: `Applies ${_chunkFQZOBLAEjs.name} configuration from ESLint config`,
      url: `https://github.com/justjake/${_chunkFQZOBLAEjs.name}`
    },
    schema: [_chunkFQZOBLAEjs.SeatbeltConfigSchema]
  },
  create(context) {
    const filename = _nullishCoalesce(_optionalChain([context, 'access', _6 => _6.getFilename, 'optionalCall', _7 => _7()]), () => ( context.filename));
    onConfigureRule(filename);
    const eslintSharedConfigViaShortName = _optionalChain([context, 'access', _8 => _8.settings, 'optionalAccess', _9 => _9.seatbelt]);
    const eslintSharedConfigViaPackageName = _optionalChain([context, 'access', _10 => _10.settings, 'optionalAccess', _11 => _11[_chunkFQZOBLAEjs.name]]);
    const eslintSharedConfig = _nullishCoalesce(eslintSharedConfigViaShortName, () => ( eslintSharedConfigViaPackageName));
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
var { name: name3, version: version3 } = _chunkFQZOBLAEjs.package_default;
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


exports.default = src_default;

module.exports = exports.default;
//# sourceMappingURL=index.js.map