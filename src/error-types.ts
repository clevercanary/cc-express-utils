/**
 * Error Types
 */
export interface Dictionary<T> {
    [key: string]: T;
}

/**
 * Express Response Error With HTTP Status Code
 */
export class ResponseError extends Error {

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
export class ValidationError extends Error {

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

