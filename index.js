/**
 * Express-related utils
 */

"use strict";

var UAParser = require("ua-parser-js");
var parser = new UAParser();
var _ = require("lodash");
var nodemailer = require("nodemailer");
var sendgrid = require("sendgrid");
var mandrill = require("mandrill-api");

/**
 *
 * And now for some handlebars helpers...
 * And now for some handlebars helpers...
 * And now for some handlebars helpers...
 *
 * */

/**
 *
 * @param options
 * @returns {*}
 */

exports.hbHelperIsProd = function(options) {

    if( process.env.NODE_ENV === 'production' ) {
        return options.fn(this);
    }
    else {
        return options.inverse(this);
    }
};

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
function setupResponseCallback(res, formatFn) {

    return function (error, returnValue) {

        if (error) {

            if (error instanceof ValidationError) {

                var errObj = error.formatFormFieldErrors();
                return res.status(error.statusCode).json(errObj);
            }
            else {

                var statusCode = 500;
                if (error.statusCode) {
                    statusCode = error.statusCode;
                }
                return res.status(statusCode).json(error);
            }
        }

        if ( formatFn ) {
            returnValue = formatFn(returnValue);
        }

        res.status(200).json(returnValue);
    };
}
exports.setupResponseCallback = setupResponseCallback;

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
 * Validation Errors
 *
 * @param {Array} errors - of the format:
 * @constructor
 */
function ValidationError(errors) {

    if (!Array.isArray(errors)) {
        errors = [errors];
    }
    this.errors = errors;
    this.statusCode = 422;
    this.name = "ValidationError";
    var err = Error("ValidationError");
    this.stack = err.stack;
    console.log(this.stack);
}

ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.constructor = ValidationError;

/**
 * Format Form Field Errors:
 *
 * {
 *  name: {
 *   msg: "Invalid name, name must be a string",
  *  value: 123
  * }
 * 
 * @returns {Object}
 */
ValidationError.prototype.formatFormFieldErrors = function() {

    var errObj = {};
    var errors = this.errors;

    for (var i = 0; i < errors.length; i++) {

        var fieldErr = errors[i];
        errObj[fieldErr.param] = {
            msg: fieldErr.msg,
            value: fieldErr.value
        };
    }

    return errObj;
};
exports.ValidationError = ValidationError;

/**
 * Handle caching issue on safari page refresh
 *
 * @param req
 * @param res
 * @param next
 */
exports.handleSafariCaching = function(req, res, next) {

    var ua = parser.setUA(req.headers["user-agent"]).getResult();
    var cc = req.get("cache-control");

    var isSafari = ua.browser.name === "Safari" || ua.browser.name === "[Mobile] Safari";

    if (isSafari && cc === "max-age=0") {
        req.headers["cache-control"] = "no-cache";
    }
    next();
};


/**
 *
 * @param app {Object}
 * @param config {Object}
 * @param ErrorModel {Object}
 */
exports.handleUncaughtErrors = function(app, config, ErrorModel) {

    var client;
    var clientType;

    if (config.email.sendgrid && config.email.sendgrid.username && config.email.sendgrid.apiKey) {

        client = sendgrid(config.email.sendgrid.username, config.email.sendgrid.apiKey);
        clientType = "SENDGRID";
    }
    else if (config.email.mandrillApiKey) {

        client = new mandrill.Mandrill(config.email.mandrillApiKey);
        clientType = "MANDRILL";
    }

    process.on("uncaughtException", function (error) {

        emailError(error, function() {

            ErrorModel.create({
                stack: error.stack
            }, function () {

                console.error(error);
                process.exit();
            });
        });
    });

    app.use(function(error, req, res, next) {

        console.error(error.stack);

        emailError(error, function() {

            ErrorModel.create({
                user: req.user._id,
                userAgent: req.headers["user-agent"],
                method: req.method,
                url: req.originalUrl,
                query: JSON.stringify(req.query),
                body: JSON.stringify(req.body),
                stack: error.stack
            }, function () {

                console.error(error);
                return setupResponseCallback(res)({message: "Express error"});
            });
        });
    });

    /**
     *
     * @param error {error}
     * @param next {function}
     * @returns {*}
     */
    function emailError(error, next) {

        var mailOptions = {
            to: config.email.admins,
            subject: "Application Error",
            html: error.stack.replace(/\n/gm, "<br />")
        };

        /**
         * PRODUCTION
         */
        if (app.get("env") === "production") {

            if (clientType === "SENDGRID") {

                _.extend(mailOptions, {
                    from: config.email.noReply,
                    fromname: config.email.noReplyName
                });
                return client.send(mailOptions, next);
            }
            else if (clientType === "MANDRILL") {

                var message = {
                    to: config.email.admins,
                    from_email: config.noReply,
                    from_name: config.noReplyName,
                    subject: "Application Error",
                    html: error.stack.replace(/\n/gm, "<br />"),
                    track_opens: true,
                    track_clicks: true
                };
                return client.messages.send({message: message});
            }
        }

        /**
         * LOCAL
         */
        if (app.get("env") === "local" && config.email.debug) {

            _.extend(mailOptions, {
                from: "\"" + config.email.noReplyName + "\" <" + config.email.noReply + ">"
            });
            var transport = nodemailer.createTransport("SES", {
                AWSAccessKeyID: process.env.AWS_ACCESS_KEY_ID,
                AWSSecretKey: process.env.AWS_SECRET_KEY
            });

            transport.sendMail(mailOptions, function(error) {

                if (error) {
                    console.log("transport error:\n");
                    console.log(error);
                }
                transport.close();
                next();
            });
        }
    }
};
