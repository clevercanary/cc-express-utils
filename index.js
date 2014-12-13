'use strict';

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

//
// Create customer error message for the specified field in
// the format:
// {
//     message: "My error message"
// }
//
function createFormFieldErrorMessage(fieldName, message) {

    var errors = {};
    errors[fieldName] = {
        message: message
    };

    return {
        errors:errors
    };
};
