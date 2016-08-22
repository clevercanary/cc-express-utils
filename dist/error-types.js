"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Express Response Error With HTTP Status Code
 */
var ResponseError = (function (_super) {
    __extends(ResponseError, _super);
    function ResponseError(message, statusCode) {
        _super.call(this, message);
        this.statusCode = statusCode;
    }
    ResponseError.prototype.toObject = function () {
        return {
            statusCode: this.statusCode,
            message: this.message
        };
    };
    ResponseError.fromError = function (error, statusCode) {
        var err = new ResponseError(error.message, statusCode || 500);
        err.stack = error.stack;
        return err;
    };
    return ResponseError;
}(Error));
exports.ResponseError = ResponseError;
var ValidationError = (function (_super) {
    __extends(ValidationError, _super);
    function ValidationError(validationErrors) {
        _super.call(this, "Validation Error");
        this.statusCode = 422;
        if (isValidationErrorArray(validationErrors)) {
            this.errors = validationErrors;
        }
        else {
            this.errors = [validationErrors];
        }
    }
    /**
     * Format Validation Errors into A Single Object Response
     */
    ValidationError.prototype.formatFormFieldErrors = function () {
        var errorResponse = {};
        this.errors.forEach(function (err) {
            errorResponse[err.param] = {
                msg: err.msg,
                value: err.value
            };
        });
        return errorResponse;
    };
    return ValidationError;
}(Error));
exports.ValidationError = ValidationError;
/**
 * PRIVATES
 */
/**
 * Type Guard For Validation Errors Array
 *
 * @param errors
 * @returns {boolean}
 */
function isValidationErrorArray(errors) {
    return Array.isArray(errors);
}
//# sourceMappingURL=error-types.js.map