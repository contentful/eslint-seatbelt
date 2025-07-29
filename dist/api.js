"use strict";Object.defineProperty(exports, "__esModule", {value: true});


var _chunkEVZG2A2Jjs = require('./chunk-EVZG2A2J.js');





















var _chunkFQZOBLAEjs = require('./chunk-FQZOBLAE.js');

// src/FileLock.ts
var _fs = require('fs');
var { O_CREAT, O_EXCL, O_RDWR } = _fs.constants;
var waitBuffer = new Int32Array(new SharedArrayBuffer(4));
var FileLock = class {
  constructor(filename) {
    this.filename = filename;
  }
  
  tryLock() {
    this.assertNotLocked();
    try {
      this.fd = _fs.openSync.call(void 0, this.filename, O_CREAT | O_EXCL | O_RDWR);
      return true;
    } catch (e) {
      if (_chunkEVZG2A2Jjs.isErrno.call(void 0, e, "EEXIST")) {
        return false;
      }
      throw e;
    }
  }
  waitLock(timeoutMs) {
    const deadline = Date.now() + timeoutMs;
    while (!this.tryLock()) {
      if (Date.now() > deadline) {
        throw new Error(`Timed out waiting for lock on ${this.filename}`);
      }
      Atomics.wait(waitBuffer, 0, 0, 1);
    }
  }
  isLocked() {
    return this.fd !== void 0;
  }
  unlock() {
    if (this.fd !== void 0) {
      _fs.closeSync.call(void 0, this.fd);
      _fs.rmSync.call(void 0, this.filename);
      this.fd = void 0;
    }
  }
  assertNotLocked() {
    if (this.fd !== void 0) {
      throw new Error(
        `FileLock "${this.filename}" is already locked by this process [pid ${process.pid}]`
      );
    }
  }
};























exports.FileLock = FileLock; exports.SEATBELT_DISABLE = _chunkFQZOBLAEjs.SEATBELT_DISABLE; exports.SEATBELT_DISABLE_IN_EDITOR = _chunkFQZOBLAEjs.SEATBELT_DISABLE_IN_EDITOR; exports.SEATBELT_FILE = _chunkFQZOBLAEjs.SEATBELT_FILE; exports.SEATBELT_FILE_NAME = _chunkFQZOBLAEjs.SEATBELT_FILE_NAME; exports.SEATBELT_FROZEN = _chunkFQZOBLAEjs.SEATBELT_FROZEN; exports.SEATBELT_INCREASE = _chunkFQZOBLAEjs.SEATBELT_INCREASE; exports.SEATBELT_KEEP = _chunkFQZOBLAEjs.SEATBELT_KEEP; exports.SEATBELT_PWD = _chunkFQZOBLAEjs.SEATBELT_PWD; exports.SEATBELT_ROOT = _chunkFQZOBLAEjs.SEATBELT_ROOT; exports.SEATBELT_THREADSAFE = _chunkFQZOBLAEjs.SEATBELT_THREADSAFE; exports.SEATBELT_VERBOSE = _chunkFQZOBLAEjs.SEATBELT_VERBOSE; exports.SeatbeltArgs = _chunkFQZOBLAEjs.SeatbeltArgs; exports.SeatbeltConfig = _chunkFQZOBLAEjs.SeatbeltConfig; exports.SeatbeltConfigSchema = _chunkFQZOBLAEjs.SeatbeltConfigSchema; exports.SeatbeltEnv = _chunkFQZOBLAEjs.SeatbeltEnv; exports.SeatbeltFile = _chunkEVZG2A2Jjs.SeatbeltFile; exports.formatFilename = _chunkFQZOBLAEjs.formatFilename; exports.formatRuleId = _chunkFQZOBLAEjs.formatRuleId; exports.logStderr = _chunkFQZOBLAEjs.logStderr; exports.logStdout = _chunkFQZOBLAEjs.logStdout; exports.padVarName = _chunkFQZOBLAEjs.padVarName;
//# sourceMappingURL=api.js.map