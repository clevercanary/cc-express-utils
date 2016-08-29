/**
 * Express Handlers
 */
import { Response, NextFunction } from "express";
import { Request } from "./typings";

import { UAParser } from "ua-parser-js";
const parser = new UAParser();

/**
 * Social Bot
 *
 * @param req
 * @param res
 * @param next
 */
export function socialBot(req: Request, res: Response, next: NextFunction): any {

    let ua = parser.setUA(req.headers['user-agent'] as string).getResult().ua;

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
 * Handle caching issue on safari page refresh
 *
 * @param req
 * @param res
 * @param next
 */
export function handleSafariCaching(req: Request, res: Response, next: NextFunction): any {

    let ua = parser.setUA(req.headers["user-agent"] as string).getResult();
    let cc = req.get("cache-control");

    let isSafari = ua.browser.name === "Safari" || ua.browser.name === "[Mobile] Safari";

    if (isSafari && cc === "max-age=0") {
        req.headers["cache-control"] = "no-cache";
    }
    next();
}