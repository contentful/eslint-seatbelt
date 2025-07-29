type SourceFileName = string;
type RuleId = string;
interface SeatbeltFileLine {
    encoded?: string;
    filename: SourceFileName;
    ruleId: RuleId;
    maxErrors: number;
}
type SeatbeltFileJson = {
    filename: SourceFileName;
    data: Record<SourceFileName, Record<RuleId, number>>;
};
interface SeatbeltStateFileData {
    maxErrors?: Map<RuleId, number>;
    lines: SeatbeltFileLine[];
}
/**
 * The state file is a Map<filename, Map<ruleId, allowedErrors>>.
 * It is stored in "tab separated json" format. This format is chosen over JSON
 * or YAML because each line is independent, which makes resolving merge
 * conflicts much easier than in a syntactically hierarchical format.
 */
declare class SeatbeltFile {
    readonly filename: string;
    protected data: Map<SourceFileName, SeatbeltStateFileData>;
    readonly comments: string;
    static readSync(filename: string): SeatbeltFile;
    /**
     * Read `filename` if it exists, otherwise create a new empty seatbelt file object
     * that will write to that filename.
     */
    static openSync(filename: string): SeatbeltFile;
    static parse(filename: string, text: string): SeatbeltFile;
    static fromJSON(json: SeatbeltFileJson): SeatbeltFile;
    changed: boolean;
    private readonly dirname;
    private useTempDirForWrites;
    constructor(filename: string, data: Map<SourceFileName, SeatbeltStateFileData>, comments?: string);
    filenames(): IterableIterator<SourceFileName>;
    getMaxErrors(filename: SourceFileName): ReadonlyMap<RuleId, number> | undefined;
    removeFile(filename: SourceFileName, args: SeatbeltArgs): boolean;
    updateMaxErrors(filename: SourceFileName, args: SeatbeltArgs, ruleToErrorCount: ReadonlyMap<RuleId, number>): {
        removedRules: Set<string>;
        increasedRulesCount: number;
        decreasedRulesCount: number;
    };
    toDataString(): string;
    readSync(): boolean;
    flushChanges(): {
        updated: boolean;
    };
    writeSync(): void;
    toJSON(): SeatbeltFileJson;
    toRelativePath(filename: string): string;
    toAbsolutePath(filename: string): string;
}

declare const SEATBELT_FILE_NAME = "eslint.seatbelt.tsv";
declare const SEATBELT_FROZEN = "SEATBELT_FROZEN";
declare const SEATBELT_INCREASE = "SEATBELT_INCREASE";
declare const SEATBELT_KEEP = "SEATBELT_KEEP";
declare const SEATBELT_FILE = "SEATBELT_FILE";
declare const SEATBELT_PWD = "SEATBELT_PWD";
declare const SEATBELT_DISABLE = "SEATBELT_DISABLE";
declare const SEATBELT_DISABLE_IN_EDITOR = "SEATBELT_DISABLE_IN_EDITOR";
declare const SEATBELT_THREADSAFE = "SEATBELT_THREADSAFE";
declare const SEATBELT_VERBOSE = "SEATBELT_VERBOSE";
declare const SEATBELT_ROOT = "SEATBELT_ROOT";
interface SeatbeltConfigWithPwd extends SeatbeltConfig {
    pwd: string;
}
/**
 * Configuration for seatbelt can be provided in a few ways:
 *
 * 1. Defined in the shared `settings` object in your ESLint config. This
 *    requires also configuring the `eslint-seatbelt/configure` rule.
 *
 *     ```js
 *     // in eslint.config.js
 *     const config = [
 *       {
 *         settings: {
 *           seatbelt: {
 *             // ...
 *           }
 *         },
 *         rules: {
 *           "eslint-seatbelt/configure": "error",
 *         }
 *       }
 *     ]
 *     ```
 *
 * 2. Using the `eslint-seatbelt/configure` rule in your ESLint config.
 *    This can be used to override settings for specific files in legacy ESLint configs.
 *    Any configuration provided here will override the shared `settings` object.
 *
 *     ```js
 *     // in .eslintrc.js
 *     module.exports = {
 *       rules: {
 *         "eslint-seatbelt/configure": "error",
 *       },
 *       overrides: [
 *         {
 *           files: ["some/path/*"],
 *           rules: {
 *             "eslint-seatbelt/configure": ["error", { seatbeltFile: "some/path/eslint.seatbelt.tsv" }]
 *           },
 *         },
 *       ],
 *     }
 *     ```
 * 3. The settings in config files can be overridden with environment variables when running `eslint` or other tools.
 *
 *    ```bash
 *    SEATBELT_FILE=some/path/eslint.seatbelt.tsv SEATBELT_FROZEN=1 eslint
 *    ```
 */
interface SeatbeltConfig {
    /**
     * The seatbelt file stores the max error counts allowed for each file. Should
     * be an absolute path.
     *
     * If not provided, $SEATBELT_PWD/eslint.seatbelt.tsv or $PWD/eslint.seatbelt.tsv will be used.
     *
     * ```js
     * // in eslint.config.js
     * const config = [
     *   {
     *     settings: {
     *       seatbelt: {
     *         // commonjs
     *         seatbeltFile: `${__dirname}/eslint.seatbelt.tsv`
     *         // esm
     *         seatbeltFile: new URL('./eslint.seatbelt.tsv', import.meta.url).pathname
     *       }
     *     }
     *   }
     * ]
     * ```
     *
     * You can also set this with environment variable `SEATBELT_FILE`:
     *
     * ```bash
     * SEATBELT_FILE=.config/custom-seatbelt-file eslint
     * ```
     */
    seatbeltFile?: string;
    /**
     * By default whenever a file is linted and a rule has no errors, that rule's
     * max errors for the file is set to zero.
     *
     * However with typescript-eslint, it can be helpful to have two ESLint configs:
     *
     * - A default ESLint config with only syntactic rules enabled that don't
     *   require typechecking, that runs on developer machines and in their editor.
     * - A CI-only ESLint config with only type-aware rules enabled that requires
     *   typechecking. Since these rules require typechecking, they can be too
     *   slow to run in interactive contexts.
     *
     * To avoid this, set `keepRules` to the names of *disabled but known rules*
     * while linting.
     *
     * Example:
     *
     * ```js
     * // Default ESLint config
     * module.exports = [
     *   {
     *     settings: {
     *       seatbelt: {
     *         keepRules: require('./eslint-typed.config.js').flatMap(config => Object.keys(config.rules ?? {})),
     *       }
     *     },
     *     rules: {
     *       "no-unused-vars": "error",
     *     },
     *   }
     * ]
     *
     * // Typechecking-required ESLint config for CI
     * module.exports = [
     *   {
     *     settings: {
     *       seatbelt: {
     *         keepRules: require('./eslint.config.js').flatMap(config => Object.keys(config.rules ?? {})),
     *       }
     *     },
     *     rules: {
     *       // Requires typechecking (slow)
     *       "@typescript-eslint/no-floating-promises": "error",
     *     },
     *   }
     * ]
     * ```
     *
     * You can also set this with environment variable `SEATBELT_KEEP`:
     *
     * ```bash
     * SEATBELT_KEEP="@typescript-eslint/no-floating-promises @typescript-eslint/prefer-reduce-type-parameter" \
     *   eslint
     * ```
     *
     * You can set this to `"ALL"` to enable this setting for ALL rules:
     *
     * ```bash
     * SEATBELT_KEEP=ALL eslint
     * ```
     */
    keepRules?: RuleId[] | "all";
    /**
     * When you enable a rule for the first time, lint with it in this set to set
     * the initial max error counts.
     *
     * Typically this should be enabled for one lint run only via an environment
     * variable, but it can also be configured via ESLint settings.
     *
     * ```bash
     * SEATBELT_INCREASE="@typescript-eslint/no-floating-promises" eslint
     * ```
     *
     * You can set this to `"ALL"` to enable this setting for ALL rules:
     *
     * ```bash
     * SEATBELT_INCREASE=ALL eslint
     * ```
     *
     * ```js
     * // in eslint.config.js
     * // maybe you have a use-case for this
     * const config = [
     *   {
     *     settings: {
     *       seatbelt: {
     *         allowIncreaseRules: ["@typescript-eslint/no-floating-promises"],
     *       }
     *     }
     *   }
     * ]
     * ```
     */
    allowIncreaseRules?: RuleId[] | "all";
    /**
     * Error if there is any change in the number of errors in the seatbelt file.
     * This is useful in CI to ensures that developers keep the seatbelt file up-to-date as they fix errors.
     *
     * It is enabled by default when environment variable `CI` is set.
     *
     * ```bash
     * CI=1 eslint
     * ```
     *
     * This can be set with the `SEATBELT_FROZEN` environment variable.
     *
     * ```bash
     * SEATBELT_FROZEN=1 eslint
     * ```
     *
     * Or in ESLint config:
     *
     * ```js
     * // in eslint.config.js
     * const config = [
     *   {
     *     settings: {
     *       seatbelt: {
     *         frozen: true,
     *       }
     *     }
     *   }
     * ]
     * ```
     */
    frozen?: boolean;
    /**
     * Completely disable seatbelt error processing for a lint run while leaving it otherwise configured.
     *
     * This can be set with the `SEATBELT_DISABLE` environment variable.
     *
     * ```bash
     * SEATBELT_DISABLE=1 eslint
     * ```
     *
     * Or in ESLint config:
     *
     * ```js
     * // in eslint.config.js
     * const config = [
     *   {
     *     settings: {
     *       seatbelt: {
     *         disable: true,
     *       }
     *     }
     *   }
     * ]
     * ```
     */
    disable?: boolean;
    /**
     * Use this in your IDE config to block seatbelt from automatically updating
     * the exceptions file when eslint is running during the `onType` event.
     */
    disableInEditor?: boolean;
    /**
     * By default seatbelt assumes that only one ESLint process will read and
     * write to the seatbelt file at a time.
     *
     * This should be set to `true` if you use a parallel ESLint runner similar to
     * jest-runner-eslint to avoid losing updates during parallel writes to the
     * seatbelt file.
     *
     * When enabled, seatbelt creates temporary lock files to serialize updates to
     * the seatbelt file. This comes at a small performance cost.
     *
     * This is enabled by default when run with Jest (environment variable `JEST_WORKER_ID` is set).
     *
     * It can also be set with environment variable `SEATBELT_THREADSAFE`:
     *
     * ```bash
     * SEATBELT_THREADSAFE=1 eslint-parallel
     * ```
     *
     * Or in ESLint config:
     *
     * ```js
     * // in eslint.config.js
     * const config = [
     *   {
     *     settings: {
     *       seatbelt: {
     *         threadsafe: true,
     *       }
     *     }
     *   }
     * ]
     * ```
     */
    threadsafe?: boolean;
    /**
     * Enable verbose logging.
     *
     * This can be set with the `SEATBELT_VERBOSE` environment variable.
     *
     * ```bash
     * SEATBELT_VERBOSE=1 eslint
     * ```
     *
     * Or in ESLint config:
     *
     * ```js
     * // in eslint.config.js
     * const config = [
     *   {
     *     settings: {
     *       seatbelt: {
     *         verbose: true,
     *       }
     *     }
     *   }
     * ]
     * ```
     *
     * If set to a function (like `console.error`), that function will be called with the log messages.
     * The default logger when set to `true` is `console.error`.
     */
    verbose?: boolean | "stdout" | "stderr" | ((...message: unknown[]) => void);
    /**
     * Repository or project root.
     * By default this is inferred from `seatbeltFile` by checking ancestor directories for `.git`.
     * Used for editor integration to disable seatbelt during git actions like rebase or merge.
     *
     * This can be set with the `SEATBELT_ROOT` environment variable.
     */
    root?: string;
}
declare const SeatbeltConfig: {
    readonly withEnvOverrides: (config: SeatbeltConfig, env: SeatbeltEnv & FallbackEnv) => SeatbeltConfig;
    readonly fromFallbackEnv: (env: FallbackEnv, log?: (...message: unknown[]) => void) => SeatbeltConfig;
    readonly fromEnvOverrides: (env: SeatbeltEnv, log?: (...message: unknown[]) => void) => SeatbeltConfigWithPwd;
};
/** Catalogues the names of environment variables */
interface SeatbeltEnv {
    [SEATBELT_INCREASE]?: string;
    [SEATBELT_KEEP]?: string;
    [SEATBELT_FILE]?: string;
    [SEATBELT_PWD]?: string;
    [SEATBELT_THREADSAFE]?: string;
    [SEATBELT_DISABLE]?: string;
    [SEATBELT_DISABLE_IN_EDITOR]?: string;
    [SEATBELT_FROZEN]?: string;
    [SEATBELT_VERBOSE]?: string;
    [SEATBELT_ROOT]?: string;
}
declare const SeatbeltEnv: {
    readonly parseRuleSetEnvVar: (value: string | undefined) => RuleId[] | "all" | undefined;
    readonly readBooleanEnvVar: (value: string | undefined) => boolean | undefined;
};
/** Environment variables we may consider that don't override explicitly set config values. */
interface FallbackEnv {
    CI?: string;
    JEST_WORKER_ID?: string;
}
declare const logStdout: (...message: unknown[]) => void;
declare const logStderr: (...message: unknown[]) => void;
/** A parsed {@link SeatbeltConfig} with all properties converted to runtime types. */
type SeatbeltArgs = {
    [K in keyof SeatbeltConfig]-?: "all" | RuleId[] extends SeatbeltConfig[K] ? "all" | Set<RuleId> : SeatbeltConfig[K];
};
declare const SeatbeltArgs: {
    fromConfig(config: SeatbeltConfig & {
        pwd?: string;
    }): SeatbeltArgs;
    getLogger(args: SeatbeltArgs): (...message: unknown[]) => void;
    ruleSetHas(ruleSet: "all" | Set<RuleId>, ruleId: RuleId): boolean;
    verboseLog(args: SeatbeltArgs, makeMessage: () => string | unknown[]): void;
    findSeatbeltFile(cwd: string): string;
};
declare function padVarName(name: string): string;
declare function formatFilename(filename: string): string;
declare function formatRuleId(ruleId: RuleId | null): string;

export { type FallbackEnv as F, type RuleId as R, SEATBELT_FILE_NAME as S, SEATBELT_FROZEN as a, SEATBELT_INCREASE as b, SEATBELT_KEEP as c, SEATBELT_FILE as d, SEATBELT_PWD as e, SEATBELT_DISABLE as f, SEATBELT_DISABLE_IN_EDITOR as g, SEATBELT_THREADSAFE as h, SEATBELT_VERBOSE as i, SEATBELT_ROOT as j, SeatbeltConfig as k, type SeatbeltConfigWithPwd as l, SeatbeltArgs as m, SeatbeltEnv as n, logStdout as o, logStderr as p, padVarName as q, formatFilename as r, formatRuleId as s, type SourceFileName as t, type SeatbeltFileJson as u, SeatbeltFile as v };
