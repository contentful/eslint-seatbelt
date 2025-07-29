export { F as FallbackEnv, R as RuleId, f as SEATBELT_DISABLE, g as SEATBELT_DISABLE_IN_EDITOR, d as SEATBELT_FILE, S as SEATBELT_FILE_NAME, a as SEATBELT_FROZEN, b as SEATBELT_INCREASE, c as SEATBELT_KEEP, e as SEATBELT_PWD, j as SEATBELT_ROOT, h as SEATBELT_THREADSAFE, i as SEATBELT_VERBOSE, m as SeatbeltArgs, k as SeatbeltConfig, l as SeatbeltConfigWithPwd, n as SeatbeltEnv, v as SeatbeltFile, u as SeatbeltFileJson, t as SourceFileName, r as formatFilename, s as formatRuleId, p as logStderr, o as logStdout, q as padVarName } from './SeatbeltConfig-D-_c4UoF.mjs';

/** Uses posix open(2) O_EXCL to implement a multi-process mutual exclusion lock. */
declare class FileLock {
    readonly filename: string;
    private fd;
    constructor(filename: string);
    tryLock(): boolean;
    waitLock(timeoutMs: number): void;
    isLocked(): boolean;
    unlock(): void;
    assertNotLocked(): void;
}

declare const SeatbeltConfigSchema: {
    description: string;
    type: "object";
    properties: {
        seatbeltFile: {
            description: string;
            type: "string";
        };
        keepRules: {
            description: string;
            anyOf: ({
                type: "array";
                items: {
                    type: "string";
                };
                const?: undefined;
            } | {
                const: string;
                type: "string";
                items?: undefined;
            })[];
        };
        allowIncreaseRules: {
            description: string;
            anyOf: ({
                type: "array";
                items: {
                    type: "string";
                };
                const?: undefined;
            } | {
                const: string;
                type: "string";
                items?: undefined;
            })[];
        };
        frozen: {
            description: string;
            type: "boolean";
        };
        disable: {
            description: string;
            type: "boolean";
        };
        disableInEditor: {
            description: string;
            type: "boolean";
        };
        threadsafe: {
            description: string;
            type: "boolean";
        };
        verbose: {
            description: string;
            anyOf: ({
                enum: (string | boolean)[];
                type?: undefined;
            } | {
                type: "object";
                enum?: undefined;
            })[];
        };
        root: {
            description: string;
            type: "string";
        };
    };
    $schema: string;
};

export { FileLock, SeatbeltConfigSchema };
