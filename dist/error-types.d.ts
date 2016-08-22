/**
 * Error Types
 */
export interface Dictionary<T> {
    [key: string]: T;
}
/**
 * Express Response Error With HTTP Status Code
 */
export declare class ResponseError extends Error {
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
export declare class ValidationError extends Error {
    errors: ValidatorError[];
    statusCode: number;
    constructor(validationErrors: ValidatorError | ValidatorError[]);
    /**
     * Format Validation Errors into A Single Object Response
     */
    formatFormFieldErrors(): Dictionary<ValidationErrorResponse>;
}
