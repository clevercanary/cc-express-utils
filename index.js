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
            console.error(error);
            return res.status(500).json(error);
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
