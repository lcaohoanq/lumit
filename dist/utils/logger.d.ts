import { type Ora } from "ora";
export declare const logger: {
    info(message: string): void;
    success(message: string): void;
    warn(message: string): void;
    error(message: string): void;
    plain(message?: string): void;
};
export declare function startSpinner(message: string): Ora;
