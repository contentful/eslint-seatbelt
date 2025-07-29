#!/usr/bin/env -S pnpm exec tsx
"use strict"; function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }






var _chunkFQZOBLAEjs = require('./chunk-FQZOBLAE.js');

// src/command.ts
var _tscommandlineargs = require('ts-command-line-args');
var ZERO_WIDTH_SPACE = "\u200B";
function parseArgs() {
  const fallback = _chunkFQZOBLAEjs.SeatbeltConfig.fromFallbackEnv(process.env);
  const overrides = _chunkFQZOBLAEjs.SeatbeltConfig.fromEnvOverrides(process.env);
  const env = { ...fallback, ...overrides };
  const escapeForChalk = (s) => s.replaceAll("{", "\\{").replaceAll("}", "\\}").replaceAll(/^(\s)/gm, (match) => `${ZERO_WIDTH_SPACE}${match}`);
  return _tscommandlineargs.parse.call(void 0, 
    {
      pwd: {
        type: String,
        defaultValue: _nullishCoalesce(env.pwd, () => ( process.cwd())),
        description: `Paths are relative to this directory`,
        optional: true
      },
      seatbeltFile: {
        type: String,
        alias: "f",
        description: escapeForChalk(
          _chunkFQZOBLAEjs.SeatbeltConfigSchema.properties.seatbeltFile.description
        ),
        defaultValue: env.seatbeltFile,
        optional: true
      },
      keepRules: {
        type: String,
        description: escapeForChalk(
          _chunkFQZOBLAEjs.SeatbeltConfigSchema.properties.keepRules.description
        ),
        defaultValue: env.keepRules,
        multiple: true,
        optional: true
      },
      allowIncreaseRules: {
        alias: "r",
        type: String,
        description: escapeForChalk(
          _chunkFQZOBLAEjs.SeatbeltConfigSchema.properties.allowIncreaseRules.description
        ),
        defaultValue: env.allowIncreaseRules,
        multiple: true,
        optional: true
      },
      frozen: {
        type: Boolean,
        description: escapeForChalk(
          _chunkFQZOBLAEjs.SeatbeltConfigSchema.properties.frozen.description
        ),
        defaultValue: env.frozen,
        optional: true
      },
      disable: {
        type: Boolean,
        description: escapeForChalk(
          _chunkFQZOBLAEjs.SeatbeltConfigSchema.properties.disable.description
        ),
        defaultValue: env.disable,
        optional: true
      },
      disableInEditor: {
        type: Boolean,
        description: escapeForChalk(
          _chunkFQZOBLAEjs.SeatbeltConfigSchema.properties.disableInEditor.description
        ),
        defaultValue: env.disableInEditor,
        optional: true
      },
      threadsafe: {
        type: Boolean,
        description: escapeForChalk(
          _chunkFQZOBLAEjs.SeatbeltConfigSchema.properties.threadsafe.description
        ),
        defaultValue: env.threadsafe,
        optional: true
      },
      verbose: {
        type: Boolean,
        description: escapeForChalk(
          _chunkFQZOBLAEjs.SeatbeltConfigSchema.properties.verbose.description
        ),
        defaultValue: env.verbose,
        optional: true
      },
      root: {
        type: String,
        description: escapeForChalk(
          _chunkFQZOBLAEjs.SeatbeltConfigSchema.properties.root.description
        ),
        defaultValue: env.root,
        optional: true
      },
      version: {
        type: Boolean,
        description: "Print the version and exit",
        optional: true,
        alias: "v"
      },
      exec: {
        type: String,
        description: "Command to execute",
        optional: true,
        defaultValue: "eslint"
      },
      help: {
        type: Boolean,
        description: "Show help and exit",
        optional: true,
        alias: "h"
      }
    },
    {
      processExitCode: 2,
      showHelpWhenArgsMissing: true,
      helpArg: "help",
      headerContentSections: [
        {
          header: _chunkFQZOBLAEjs.name,
          content: `Turns command-line arguments into ${_chunkFQZOBLAEjs.name} environment variables, then call 'eslint' or another command with them.`
        }
      ]
    }
  );
}
var stdout = (...args) => console.log(...args);
var stderr = (...args) => console.error(...args);
function main() {
  const argsConfig = parseArgs();
  if (argsConfig.version) {
    stdout(`v${_chunkFQZOBLAEjs.version}`);
    return;
  }
  if (argsConfig.verbose) {
    stderr("Parsed config:", argsConfig);
  }
  _chunkFQZOBLAEjs.logStderr.call(void 0, "command not implemented");
  process.exit(1);
}
if (_chunkFQZOBLAEjs.__require.main === module) {
  main();
}
//# sourceMappingURL=command.js.map