/**
 * Express Utilities
 */
import { Application, Response } from "express";
import { Model } from "mongoose";
import { Dictionary, HBHelperOptions, CCApplicationConfig, ErrorModel } from "./typings";
/**
 *
 * And now for some handlebars helpers...
 *
 */
export declare function hbHelperIsProd(options: HBHelperOptions): any;
/**
 * Create generic response callback, handling ResponseErrors and ValidationErrors
 * as well as untyped errors.
 *
 * Called from web controllers. Pass to service layer as a callback to
 * be invoked once service has completed coordinating/mediating.
 */
export declare function setupResponseCallback<T>(res: Response, formatFn?: (returnValue: T) => any): (error: Error, returnValue?: T) => Response;
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
 * Handle Uncaught Errors, saving a stack trace and emailing admins
 *
 * @param app {Object}
 * @param config {Object}
 * @param ErrorModel {Object}
 */
export declare function handleUncaughtErrors<T extends ErrorModel>(app: Application, config: CCApplicationConfig, ErrorModel: Model<T>): void;
