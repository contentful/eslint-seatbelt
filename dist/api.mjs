import {
  SeatbeltFile,
  isErrno
} from "./chunk-QC7OVVMO.mjs";
import {
  SEATBELT_DISABLE,
  SEATBELT_DISABLE_IN_EDITOR,
  SEATBELT_FILE,
  SEATBELT_FILE_NAME,
  SEATBELT_FROZEN,
  SEATBELT_INCREASE,
  SEATBELT_KEEP,
  SEATBELT_PWD,
  SEATBELT_ROOT,
  SEATBELT_THREADSAFE,
  SEATBELT_VERBOSE,
  SeatbeltArgs,
  SeatbeltConfig,
  SeatbeltConfigSchema,
  SeatbeltEnv,
  formatFilename,
  formatRuleId,
  logStderr,
  logStdout,
  padVarName
} from "./chunk-WPM7GDSZ.mjs";

// src/FileLock.ts
import { openSync, closeSync, constants, rmSync } from "node:fs";
var { O_CREAT, O_EXCL, O_RDWR } = constants;
var waitBuffer = new Int32Array(new SharedArrayBuffer(4));
var FileLock = class {
  constructor(filename) {
    this.filename = filename;
  }
  fd;
  tryLock() {
    this.assertNotLocked();
    try {
      this.fd = openSync(this.filename, O_CREAT | O_EXCL | O_RDWR);
      return true;
    } catch (e) {
      if (isErrno(e, "EEXIST")) {
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
      closeSync(this.fd);
      rmSync(this.filename);
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
export {
  FileLock,
  SEATBELT_DISABLE,
  SEATBELT_DISABLE_IN_EDITOR,
  SEATBELT_FILE,
  SEATBELT_FILE_NAME,
  SEATBELT_FROZEN,
  SEATBELT_INCREASE,
  SEATBELT_KEEP,
  SEATBELT_PWD,
  SEATBELT_ROOT,
  SEATBELT_THREADSAFE,
  SEATBELT_VERBOSE,
  SeatbeltArgs,
  SeatbeltConfig,
  SeatbeltConfigSchema,
  SeatbeltEnv,
  SeatbeltFile,
  formatFilename,
  formatRuleId,
  logStderr,
  logStdout,
  padVarName
};
//# sourceMappingURL=api.mjs.map