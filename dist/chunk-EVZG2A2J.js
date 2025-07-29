"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; } var _class;






var _chunkFQZOBLAEjs = require('./chunk-FQZOBLAE.js');

// src/SeatbeltFile.ts
var _os = require('os'); var os = _interopRequireWildcard(_os);
var _fs = require('fs'); var fs = _interopRequireWildcard(_fs);
var _path = require('path'); var nodePath = _interopRequireWildcard(_path);

// src/errorHanding.ts
function appendErrorContext(error, context) {
  if (error instanceof Error) {
    error.message += `
  ${context}`;
  }
}
function isErrno(error, code) {
  return error instanceof Error && "code" in error && error.code === code;
}

// src/SeatbeltFile.ts
function encodeLine(line) {
  const { filename, ruleId, maxErrors } = line;
  return `${JSON.stringify(filename)}	${JSON.stringify(ruleId)}	${maxErrors}
`;
}
function decodeLine(line, index) {
  try {
    const lineParts = line.split("	");
    if (lineParts.length !== 3) {
      throw new Error(
        `Expected 3 tab-separated JSON strings, instead have ${lineParts.length}`
      );
    }
    let filename;
    try {
      filename = JSON.parse(lineParts[0]);
    } catch (e) {
      appendErrorContext(e, "at tab-separated column 1 (filename)");
      throw e;
    }
    let ruleId;
    try {
      ruleId = JSON.parse(lineParts[1]);
    } catch (e) {
      appendErrorContext(e, "at tab-separated column 2 (RuleId)");
      throw e;
    }
    let maxErrors;
    try {
      maxErrors = JSON.parse(lineParts[2]);
    } catch (e) {
      appendErrorContext(e, "at tab-separated column 3 (maxErrors)");
      throw e;
    }
    return {
      encoded: line,
      filename,
      ruleId,
      maxErrors
    };
  } catch (e) {
    appendErrorContext(e, `at line ${index + 1}: \`${line.trim()}\``);
    throw e;
  }
}
var COMMENT_LINE_REGEX = /^\s*#/;
var NON_EMPTY_LINE_REGEX = /\S+/;
var DEFAULT_FILE_HEADER = `
# ${_chunkFQZOBLAEjs.name} temporarily allowed errors
# docs: https://github.com/justjake/${_chunkFQZOBLAEjs.name}#readme
`.trim();
var SeatbeltFile = (_class = class _SeatbeltFile {
  constructor(filename, data, comments = "") {;_class.prototype.__init.call(this);_class.prototype.__init2.call(this);
    this.filename = filename;
    this.data = data;
    this.comments = comments;
    this.filename = nodePath.default.resolve(this.filename);
    this.dirname = nodePath.default.dirname(this.filename);
  }
  static readSync(filename) {
    const text = fs.readFileSync(filename, "utf8");
    try {
      return _SeatbeltFile.parse(filename, text);
    } catch (e) {
      appendErrorContext(e, `in seatbelt file \`${filename}\``);
      throw e;
    }
  }
  /**
   * Read `filename` if it exists, otherwise create a new empty seatbelt file object
   * that will write to that filename.
   */
  static openSync(filename) {
    try {
      return _SeatbeltFile.readSync(filename);
    } catch (e) {
      if (isErrno(e, "ENOENT")) {
        return new _SeatbeltFile(filename, /* @__PURE__ */ new Map(), DEFAULT_FILE_HEADER);
      }
      throw e;
    }
  }
  static parse(filename, text) {
    const data = /* @__PURE__ */ new Map();
    const split = text.split(/(?<=\n)/);
    const lines = split.filter(
      (line) => NON_EMPTY_LINE_REGEX.test(line) && !COMMENT_LINE_REGEX.test(line)
    ).map(decodeLine);
    const comments = split.filter((line) => COMMENT_LINE_REGEX.test(line)).join("");
    lines.forEach((line) => {
      let fileState = data.get(line.filename);
      if (!fileState) {
        fileState = { maxErrors: void 0, lines: [] };
        data.set(line.filename, fileState);
      }
      fileState.lines.push(line);
    });
    return new _SeatbeltFile(filename, data, comments.trim());
  }
  static fromJSON(json) {
    const data = new Map(
      Object.entries(json.data).map(([filename, maxErrors]) => [
        filename,
        { maxErrors: new Map(Object.entries(maxErrors)), lines: [] }
      ])
    );
    return new _SeatbeltFile(json.filename, data);
  }
  __init() {this.changed = false}
  
  __init2() {this.useTempDirForWrites = true}
  *filenames() {
    for (const filename of this.data.keys()) {
      yield this.toAbsolutePath(filename);
    }
  }
  getMaxErrors(filename) {
    const fileState = this.data.get(this.toRelativePath(filename));
    if (!fileState) {
      return void 0;
    }
    fileState.maxErrors ??= parseMaxErrors(fileState.lines);
    return fileState.maxErrors;
  }
  removeFile(filename, args) {
    const relativeFilename = this.toRelativePath(filename);
    if (!this.data.has(relativeFilename)) {
      return false;
    }
    _chunkFQZOBLAEjs.SeatbeltArgs.verboseLog(
      args,
      () => args.frozen ? `${_chunkFQZOBLAEjs.formatFilename.call(void 0, filename)}: ${_chunkFQZOBLAEjs.SEATBELT_FROZEN}: didn't remove max errors` : `${_chunkFQZOBLAEjs.formatFilename.call(void 0, filename)}: remove max errors`
    );
    if (args.frozen) {
      return false;
    }
    this.data.delete(relativeFilename);
    this.changed = true;
    return true;
  }
  updateMaxErrors(filename, args, ruleToErrorCount) {
    const removedRules = /* @__PURE__ */ new Set();
    let increasedRulesCount = 0;
    let decreasedRulesCount = 0;
    this.getMaxErrors(filename);
    const relativeFilename = this.toRelativePath(filename);
    const maxErrors = _nullishCoalesce(_optionalChain([this, 'access', _ => _.data, 'access', _2 => _2.get, 'call', _3 => _3(relativeFilename), 'optionalAccess', _4 => _4.maxErrors]), () => ( /* @__PURE__ */ new Map()));
    ruleToErrorCount.forEach((errorCount, ruleId) => {
      const maxErrorCount = _nullishCoalesce(maxErrors.get(ruleId), () => ( 0));
      if (errorCount === maxErrorCount) {
        return;
      }
      if (errorCount < maxErrorCount || _chunkFQZOBLAEjs.SeatbeltArgs.ruleSetHas(args.allowIncreaseRules, ruleId)) {
        _chunkFQZOBLAEjs.SeatbeltArgs.verboseLog(
          args,
          () => args.frozen ? `${_chunkFQZOBLAEjs.formatFilename.call(void 0, filename)}: ${_chunkFQZOBLAEjs.formatRuleId.call(void 0, ruleId)}: ${_chunkFQZOBLAEjs.SEATBELT_FROZEN}: didn't update max errors ${maxErrorCount} -> ${errorCount}` : `${_chunkFQZOBLAEjs.formatFilename.call(void 0, filename)}: ${_chunkFQZOBLAEjs.formatRuleId.call(void 0, ruleId)}: update max errors ${maxErrorCount} -> ${errorCount}`
        );
        maxErrors.set(ruleId, errorCount);
        if (errorCount > maxErrorCount) {
          increasedRulesCount++;
        } else {
          decreasedRulesCount++;
        }
      }
    });
    if (args.verbose || args.keepRules !== "all") {
      maxErrors.forEach((maxErrorCount, ruleId) => {
        const shouldRemove = maxErrorCount === 0 || !ruleToErrorCount.has(ruleId);
        if (!shouldRemove) {
          return;
        }
        if (_chunkFQZOBLAEjs.SeatbeltArgs.ruleSetHas(args.keepRules, ruleId)) {
          _chunkFQZOBLAEjs.SeatbeltArgs.verboseLog(
            args,
            () => `${_chunkFQZOBLAEjs.formatFilename.call(void 0, filename)}: ${_chunkFQZOBLAEjs.formatRuleId.call(void 0, ruleId)}: ${_chunkFQZOBLAEjs.SEATBELT_KEEP}: didn't update max errors ${maxErrorCount} -> ${0}`
          );
          return;
        }
        _chunkFQZOBLAEjs.SeatbeltArgs.verboseLog(
          args,
          () => args.frozen ? `${_chunkFQZOBLAEjs.formatFilename.call(void 0, filename)}: ${_chunkFQZOBLAEjs.formatRuleId.call(void 0, ruleId)}: ${_chunkFQZOBLAEjs.SEATBELT_FROZEN}: didn't update max errors ${maxErrorCount} -> ${0}` : `${_chunkFQZOBLAEjs.formatFilename.call(void 0, filename)}: ${_chunkFQZOBLAEjs.formatRuleId.call(void 0, ruleId)}: update max errors ${maxErrorCount} -> ${0}`
        );
        maxErrors.delete(ruleId);
        removedRules.add(ruleId);
      });
    }
    const changed = increasedRulesCount > 0 || decreasedRulesCount > 0 || removedRules.size > 0;
    if (changed && !args.frozen) {
      const file = this.data.get(relativeFilename);
      if (file) {
        file.maxErrors = maxErrors;
      } else {
        this.data.set(relativeFilename, {
          maxErrors,
          lines: []
        });
      }
      this.changed = true;
    }
    return { removedRules, increasedRulesCount, decreasedRulesCount };
  }
  toDataString() {
    const lines = [];
    this.data.forEach((fileState, filename) => {
      if (fileState.maxErrors) {
        fileState.lines = [];
        fileState.maxErrors.forEach((maxErrorCount, ruleId) => {
          fileState.lines.push({ filename, ruleId, maxErrors: maxErrorCount });
        });
        fileState.lines.sort(
          (a, b) => a.ruleId === b.ruleId ? 0 : a.ruleId < b.ruleId ? -1 : 1
        );
      }
      fileState.lines.forEach((line) => {
        const encoded = line.encoded ??= encodeLine(line);
        lines.push(encoded);
      });
    });
    lines.sort();
    if (this.comments) {
      return this.comments + "\n\n" + lines.join("");
    } else {
      return lines.join("");
    }
  }
  readSync() {
    const nextStateFile = _SeatbeltFile.openSync(this.filename);
    if (nextStateFile) {
      this.data = nextStateFile.data;
      this.changed = false;
      return true;
    }
    return false;
  }
  flushChanges() {
    if (this.changed) {
      this.writeSync();
      this.changed = false;
      return { updated: true };
    }
    return { updated: false };
  }
  writeSync() {
    const dataString = this.toDataString();
    const dir = nodePath.dirname(this.filename);
    const base = nodePath.basename(this.filename);
    const tempFile = nodePath.join(
      this.useTempDirForWrites ? os.tmpdir() : dir,
      `.${base}.wip${process.pid}.${Date.now()}.tmp`
    );
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(tempFile, dataString, "utf8");
    try {
      fs.renameSync(tempFile, this.filename);
    } catch (error) {
      if (isErrno(error, "EXDEV")) {
        this.useTempDirForWrites = false;
        fs.copyFileSync(tempFile, this.filename);
        fs.rmSync(tempFile);
        return;
      }
      throw error;
    }
  }
  toJSON() {
    const data = Object.fromEntries(
      Array.from(this.data.keys()).map((filename) => {
        const maxErrors = this.getMaxErrors(filename);
        if (!maxErrors) {
          throw new Error(`${_chunkFQZOBLAEjs.name} bug: expected errors for existing key`);
        }
        return [filename, Object.fromEntries(maxErrors)];
      })
    );
    return { filename: this.filename, data };
  }
  toRelativePath(filename) {
    if (!nodePath.isAbsolute(filename)) {
      return filename;
    }
    return nodePath.relative(this.dirname, filename);
  }
  toAbsolutePath(filename) {
    if (nodePath.isAbsolute(filename)) {
      return filename;
    }
    return nodePath.resolve(this.dirname, filename);
  }
}, _class);
function parseMaxErrors(lines) {
  const maxErrors = /* @__PURE__ */ new Map();
  lines.forEach((line) => {
    maxErrors.set(line.ruleId, line.maxErrors);
  });
  return maxErrors;
}





exports.appendErrorContext = appendErrorContext; exports.isErrno = isErrno; exports.SeatbeltFile = SeatbeltFile;
//# sourceMappingURL=chunk-EVZG2A2J.js.map