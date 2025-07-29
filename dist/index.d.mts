import * as eslint from 'eslint';
import { Linter, ESLint } from 'eslint';

/**
 * See the package README for usage instructions.
 * https://github.com/justjake/eslint-seatbelt#readme
 */
declare const plugin: {
    meta: {
        name: string;
        version: string;
    };
    /**
     * https://eslint.org/docs/latest/extend/custom-processors
     */
    processors: {
        seatbelt: Linter.Processor<string | Linter.ProcessorFile>;
    };
    rules: {
        configure: eslint.Rule.RuleModule;
    };
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
        enable: ReturnType<typeof createESLint9Config>;
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
        "enable-legacy": ReturnType<typeof createLegacyConfig>;
    };
};
declare function createESLint9Config(): {
    name: string;
    plugins: {
        [x: string]: ESLint.Plugin;
    };
    rules: {
        [x: string]: "error";
    };
    processor: string;
};
declare function createLegacyConfig(): {
    plugins: string[];
    rules: {
        [x: string]: "error";
    };
    processor: string;
};

export { plugin as default };
