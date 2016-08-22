"use strict";
var ua_parser_js_1 = require("ua-parser-js");
var parser = new ua_parser_js_1.UAParser();
/**
 * Social Bot
 *
 * @param req
 * @param res
 * @param next
 */
function socialBot(req, res, next) {
    var ua = parser.setUA(req.headers['user-agent']).getResult().ua;
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
exports.socialBot = socialBot;
/**
 * Handle caching issue on safari page refresh
 *
 * @param req
 * @param res
 * @param next
 */
function handleSafariCaching(req, res, next) {
    var ua = parser.setUA(req.headers["user-agent"]).getResult();
    var cc = req.get("cache-control");
    var isSafari = ua.browser.name === "Safari" || ua.browser.name === "[Mobile] Safari";
    if (isSafari && cc === "max-age=0") {
        req.headers["cache-control"] = "no-cache";
    }
    next();
}
exports.handleSafariCaching = handleSafariCaching;
//# sourceMappingURL=express-handlers.js.map