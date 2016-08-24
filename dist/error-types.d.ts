/**
 * Error Types
 */
import { Dictionary } from "./typings";
/**
 * Error used for extension. ES5 can't inherit Error directly without some hacking.
 * (this.constructor as any) is to handle typescript es5 lib errors.
 */
export declare class ExtendableError extends Error {
    constructor(message: string);
}
/**
 * Express Response Error With HTTP Status Code
 */
export declare class ResponseError extends ExtendableError {
    statusCode: number;
    constructor(message: string, statusCode: number);
    toObject(): {
        statusCode: number;
        message: string;
    };
    static fromError(error: Error, statusCode?: number): ResponseError;
}
/**
 * Express-Validator Error Handler
 */
export interface ValidationErrorResponse {
    [key: string]: {
        msg: string;
        value: any;
    };
}
export interface ValidatorError {
    param: string;
    msg: string;
    value: any;
}
export declare class ValidationError extends ExtendableError {
    errors: ValidatorError[];
    statusCode: number;
    constructor(validationErrors: ValidatorError | ValidatorError[]);
    /**
     * Format Validation Errors into A Single Object Response
     */
    formatFormFieldErrors(): Dictionary<ValidationErrorResponse>;
}
