/**
 * Express-related utils
 */

"use strict";

/**
 * Create response callback function, returning either 500 on error
 * or 200 with data.
 *
 * Called from web controllers. Pass to service layer as a callback to
 * be invoked once service has completed coordinating/mediating.
 *
 * @param {Object} res - HTTP Response
 * @param {Function} [formatFn] - Function for formatting response value. Optional.
 */
exports.setupResponseCallback = function (res, formatFn) {

    return function (error, returnValue) {

        if (error) {

            if (error instanceof ValidationError) {

                var errObj = error.formatFormFieldErrors();
                return res.status(error.statusCode).json(errObj);
            }
            else {
                return res.status(500).json(error);
            }
        }

        if ( formatFn ) {
            returnValue = formatFn(returnValue);
        }

        res.status(200).json(returnValue);
    };
};

/**
 * Create customer error message for the specified field in
 * the format:
 *
 * {
 *   message: "My error message"
 * }
 *
 * @param fieldName Name of field with validation error
 * @param message Error text
 */
exports.createFormFieldErrorMessage = function(fieldName, message) {

    var errors = {};
    errors[fieldName] = {
        message: message
    };

    return {
        errors:errors
    };
};

/**
 * Form Field Validation
 *
 * Errors as:
 * {
 *    name: {
 *      msg: "Invalid name",
 *      value: 123
 *    }
 * }
 *
 * @param {Array} errors
 * @constructor
 */
function ValidationError(errors) {

    if (!Array.isArray(errors)) {
        errors = [errors];
    }
    this.errors = errors;
    this.statusCode = 422;
}

ValidationError.prototype.formatFormFieldErrors = function() {

    var errObj = {};

    var errors = this.errors;
    for (var i = 0; i < errors.length; i++) {

        var fieldErr = errors[i];
        errObj[fieldErr.param] = {
            msg: fieldErr.msg,
            value: fieldErr.value
        }
    }
    return errObj;
};
exports.ValidationError = ValidationError;
