#!/usr/bin/env -S pnpm exec tsx
import { k as SeatbeltConfig } from './SeatbeltConfig-D-_c4UoF.js';

interface SeatbeltCliConfig extends SeatbeltConfig {
    /** Paths are relative to this directory. Default: `process.cwd()` */
    pwd?: string;
    /** Print the version and exit */
    version?: boolean;
    /** Command to execute. Default: `eslint` */
    exec?: string;
    /** Show help and exit */
    help?: boolean;
}

export type { SeatbeltCliConfig };
