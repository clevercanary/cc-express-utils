/// <reference path = "../typings/globals/express-serve-static-core/index.d.ts" />
/**
 * Express-related utils
 */

/**
 * Types
 */
export interface Dictionary<T> {
    [key: string]: T;
}
export interface CCApplicationConfig {
    email: {
        sendgrid?: {
            username: string;
            apiKey: string;
        };
        mandrillApiKey?: string;
        admins: string[];
        noReply: string;
        noReplyName: string;
        debug: boolean;
    }
}
import { Application, Request, Response, NextFunction } from "express-serve-static-core";
import { Model } from "mongoose";

/**
 * External Dependencies
 */
import { UAParser } from "ua-parser-js";
import * as _ from "lodash";
import * as nodemailer from "nodemailer";
import * as sendgrid from "sendgrid";
import * as mandrill from "mandrill-api";

/**
 * Internal Dependencies
 */
import { ResponseError, ValidationError } from "./error-types";

const parser = new UAParser();

/**
 *
 * And now for some handlebars helpers...
 * And now for some handlebars helpers...
 * And now for some handlebars helpers...
 *
 * */
export interface HBHelperOptions {
    fn(self: any): any;
    inverse(self: any): any;
}
export function hbHelperIsProd(options: HBHelperOptions) {

    if (process.env.NODE_ENV === "production") {
        return options.fn(this);
    }
    else {
        return options.inverse(this);
    }
}


/**
 * Create response callback function, returning either 500 on error
 * or 200 with data.
 *
 * Called from web controllers. Pass to service layer as a callback to
 * be invoked once service has completed coordinating/mediating.
 */
interface ErrorWithCode extends Error {
    statusCode: number;
}
export function setupResponseCallback<T>(res: Response, formatFn?: (returnValue: T) => any) {

    return (error: Error, returnValue?: T) => {

        if (error) {

            if (error instanceof ValidationError) {

                var errObj = error.formatFormFieldErrors();
                return res.status(error.statusCode).json(errObj);
            }
            else if (error instanceof ResponseError) {

                return res.status(error.statusCode).json(error.toObject());
            }
            else {

                // Backward Compatibility for types
                let err = error as ErrorWithCode;
                let statusCode = err.statusCode || 500;
                return res.status(statusCode).json(error);
            }
        }

        if (formatFn) {
            returnValue = formatFn(returnValue);
        }

        res.status(200).json(returnValue);
    };
}

/**
 * Social Bot
 *
 * @param req
 * @param res
 * @param next
 */
export function socialBot(req: Request, res: Response, next: NextFunction) {

    let ua = parser.setUA(req.headers['user-agent']).getResult().ua;

    if (ua.indexOf('LinkedInBot') != -1) {
        res.locals.LinkedInBot = true;
    }

    if (ua.indexOf('facebookexternalhit') != -1) {
        res.locals.FaceblookBot = true;
    }

    if (ua.indexOf('Twitterbot') != -1) {
        res.locals.TwitterBot = true;
    }

    if (ua.indexOf('Slackbot') != -1) {
        res.locals.Slackbot = true;
    }

    next();

}

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
export function createFormFieldErrorMessage(fieldName: string, message: string) {

    let errors: Dictionary<{message: string}> = {};
    errors[fieldName] = {
        message: message
    };

    return {
        errors: errors
    };
}


/**
 * Handle caching issue on safari page refresh
 *
 * @param req
 * @param res
 * @param next
 */
export function handleSafariCaching(req: Request, res: Response, next: NextFunction) {

    let ua = parser.setUA(req.headers["user-agent"]).getResult();
    let cc = req.get("cache-control");

    let isSafari = ua.browser.name === "Safari" || ua.browser.name === "[Mobile] Safari";

    if (isSafari && cc === "max-age=0") {
        req.headers["cache-control"] = "no-cache";
    }
    next();
}


/**
 *
 * @param app {Object}
 * @param config {Object}
 * @param ErrorModel {Object}
 */
export function handleUncaughtErrors(app: Application, config: CCApplicationConfig, ErrorModel: Model<any>) {

    let client: Sendgrid.Instance | mandrill.Mandrill;
    let clientType: string;

    if (config.email.sendgrid && config.email.sendgrid.username && config.email.sendgrid.apiKey) {

        client = sendgrid(config.email.sendgrid.username, config.email.sendgrid.apiKey);
        clientType = "SENDGRID";
    }
    else if (config.email.mandrillApiKey) {

        client = new mandrill.Mandrill(config.email.mandrillApiKey);
        clientType = "MANDRILL";
    }

    process.on("uncaughtException", (error: Error) => {

        emailError(error, () => {

            ErrorModel.create({
                stack: error.stack
            }, () => {

                console.error(error);
                process.exit();
            });
        });
    });

    app.use((error: Error, req: Request, res: Response, next: NextFunction) => {

        console.error(error.stack);

        emailError(error, () => {

            ErrorModel.create({
                user: req.user._id,
                userAgent: req.headers["user-agent"],
                method: req.method,
                url: req.originalUrl,
                query: JSON.stringify(req.query),
                body: JSON.stringify(req.body),
                stack: error.stack
            }, () => {

                console.error(error);

                let responseError = new Error("Express error");
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
    function emailError(error: Error, next: ()=>void) {

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
                return (<Sendgrid.Instance>client).send(mailOptions, next);
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
                return (<mandrill.Mandrill>client).messages.send({ message: message });
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

            transport.sendMail(mailOptions, (error) => {

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
