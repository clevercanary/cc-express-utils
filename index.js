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
 * @param formatFn Function for formatting response value. Optional.
 */
exports.setupResponseCallback = function (res, formatFn) {

    return function (error, returnValue) {

        if (error) {
            console.error(error);
            return res.json(500, error);
        }

        if ( formatFn ) {
            returnValue = formatFn(returnValue);
        }

        res.json(200, returnValue);
    };
};