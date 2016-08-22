"use strict";
/**
 * External Dependencies
 */
var _ = require("lodash");
var nodemailer = require("nodemailer");
var sendgrid = require("sendgrid");
var mandrill = require("mandrill-api");
/**
 * Internal Dependencies
 */
var error_types_1 = require("./error-types");
/**
 *
 * And now for some handlebars helpers...
 *
 */
function hbHelperIsProd(options) {
    if (process.env.NODE_ENV === "production") {
        return options.fn(this);
    }
    else {
        return options.inverse(this);
    }
}
exports.hbHelperIsProd = hbHelperIsProd;
/**
 * Create generic response callback, handling ResponseErrors and ValidationErrors
 * as well as untyped errors.
 *
 * Called from web controllers. Pass to service layer as a callback to
 * be invoked once service has completed coordinating/mediating.
 */
function setupResponseCallback(res, formatFn) {
    return function (error, returnValue) {
        if (error) {
            if (error instanceof error_types_1.ValidationError) {
                var errObj = error.formatFormFieldErrors();
                return res.status(error.statusCode).json(errObj);
            }
            else if (error instanceof error_types_1.ResponseError) {
                return res.status(error.statusCode).json(error.toObject());
            }
            else {
                // Backward Compatibility for types
                var err = error;
                var statusCode = err.statusCode || 500;
                return res.status(statusCode).json(error);
            }
        }
        if (formatFn) {
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
function createFormFieldErrorMessage(fieldName, message) {
    var errors = {};
    errors[fieldName] = {
        message: message
    };
    return {
        errors: errors
    };
}
exports.createFormFieldErrorMessage = createFormFieldErrorMessage;
/**
 * Handle Uncaught Errors, saving a stack trace and emailing admins
 *
 * @param app {Object}
 * @param config {Object}
 * @param ErrorModel {Object}
 */
function handleUncaughtErrors(app, config, ErrorModel) {
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
        emailError(error, function () {
            ErrorModel.create({
                stack: error.stack
            }, function () {
                console.error(error);
                process.exit();
            });
        });
    });
    app.use(function (error, req, res, next) {
        console.error(error.stack);
        emailError(error, function () {
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
                var responseError = new Error("Express error");
                return setupResponseCallback(res)(responseError);
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
                _.assign(mailOptions, {
                    from: config.email.noReply,
                    fromname: config.email.noReplyName
                });
                return client.send(mailOptions, next);
            }
            else if (clientType === "MANDRILL") {
                var message = {
                    to: config.email.admins,
                    from_email: config.email.noReply,
                    from_name: config.email.noReplyName,
                    subject: "Application Error",
                    html: error.stack.replace(/\n/gm, "<br />"),
                    track_opens: true,
                    track_clicks: true
                };
                return client.messages.send({ message: message });
            }
        }
        /**
         * LOCAL
         */
        if (app.get("env") === "local" && config.email.debug) {
            _.assign(mailOptions, {
                from: "\"" + config.email.noReplyName + "\" <" + config.email.noReply + ">"
            });
            var transport = nodemailer.createTransport("SES", {
                AWSAccessKeyID: process.env.AWS_ACCESS_KEY_ID,
                AWSSecretKey: process.env.AWS_SECRET_KEY
            });
            transport.sendMail(mailOptions, function (error) {
                if (error) {
                    console.log("transport error:\n");
                    console.log(error);
                }
                transport.close();
                next();
            });
        }
    }
}
exports.handleUncaughtErrors = handleUncaughtErrors;
//# sourceMappingURL=utils.js.map