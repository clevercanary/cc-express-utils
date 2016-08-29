/**
 * Express Handlers
 */
import { Response, NextFunction } from "express";
import { Request } from "./typings";
/**
 * Social Bot
 *
 * @param req
 * @param res
 * @param next
 */
export declare function socialBot(req: Request, res: Response, next: NextFunction): any;
/**
 * Handle caching issue on safari page refresh
 *
 * @param req
 * @param res
 * @param next
 */
export declare function handleSafariCaching(req: Request, res: Response, next: NextFunction): any;
