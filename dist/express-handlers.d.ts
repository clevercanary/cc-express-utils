/**
 * Express Handlers
 */
import { Request, Response, NextFunction } from "express-serve-static-core";
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
