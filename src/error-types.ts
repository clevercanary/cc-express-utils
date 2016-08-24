/**
 * Error Types
 */
import { Dictionary } from "./typings";

/**
 * Error used for extension. ES5 can't inherit Error directly without some hacking.
 * (this.constructor as any) is to handle typescript es5 lib errors.
 */
export class ExtendableError extends Error {

    constructor(message: string) {
        super(message);
        this.name = (this.constructor as any).name;
        this.message = message;
        Error.captureStackTrace(this, (this.constructor as any));
    }
}

/**
 * Express Response Error With HTTP Status Code
 */
export class ResponseError extends ExtendableError {

    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }

    toObject() {
        return {
            statusCode: this.statusCode,
            message: this.message
        }
    }

    static fromError(error: Error, statusCode?: number) {
        let err = new ResponseError(error.message, statusCode || 500);
        err.stack = error.stack;
        return err;
    }
}


/**
 * Express-Validator Error Handler
 */
export interface ValidationErrorResponse {
    [key: string]: {
        msg: string;
        value: any;
    }
}
export interface ValidatorError {
    param: string;
    msg: string;
    value: any;
}
export class ValidationError extends ExtendableError {

    errors: ValidatorError[];
    statusCode: number = 422;

    constructor(validationErrors: ValidatorError | ValidatorError[]) {

        super("Validation Error");

        if(isValidationErrorArray(validationErrors)) {
            this.errors = validationErrors;
        }
        else {
            this.errors = [validationErrors];
        }
    }

    /**
     * Format Validation Errors into A Single Object Response
     */
    formatFormFieldErrors(): Dictionary<ValidationErrorResponse> {

        let errorResponse: Dictionary<ValidationErrorResponse> = {};

        this.errors.forEach((err) => {

            errorResponse[err.param] = {
                msg: err.msg,
                value: err.value
            }
        });
        return errorResponse;
    }
}

/**
 * PRIVATES
 */

/**
 * Type Guard For Validation Errors Array
 *
 * @param errors
 * @returns {boolean}
 */
function isValidationErrorArray(errors: ValidatorError | ValidatorError[]): errors is ValidatorError[] {

    return Array.isArray(errors);
}

