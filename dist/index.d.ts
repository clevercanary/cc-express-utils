/// <reference path="../typings/globals/express-serve-static-core/index.d.ts" />
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
    };
}
import { Application, Request, Response, NextFunction } from "express-serve-static-core";
import { Model } from "mongoose";
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
export declare function hbHelperIsProd(options: HBHelperOptions): any;
export declare function setupResponseCallback<T>(res: Response, formatFn?: (returnValue: T) => any): (error: Error, returnValue?: T) => Response;
/**
 * Social Bot
 *
 * @param req
 * @param res
 * @param next
 */
export declare function socialBot(req: Request, res: Response, next: NextFunction): void;
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
export declare function createFormFieldErrorMessage(fieldName: string, message: string): {
    errors: Dictionary<{
        message: string;
    }>;
};
/**
 * Handle caching issue on safari page refresh
 *
 * @param req
 * @param res
 * @param next
 */
export declare function handleSafariCaching(req: Request, res: Response, next: NextFunction): void;
/**
 *
 * @param app {Object}
 * @param config {Object}
 * @param ErrorModel {Object}
 */
export declare function handleUncaughtErrors(app: Application, config: CCApplicationConfig, ErrorModel: Model<any>): void;
