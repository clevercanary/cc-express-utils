import { Types, Document } from "mongoose";
import { Request as Req } from "express";
export interface ExpressUtilsRequest {
    user: any;
    body: any;
}
export declare type Request = ExpressUtilsRequest & Req;
export interface Dictionary<T> {
    [key: string]: T;
}
export interface HBHelperOptions {
    fn(self: any): any;
    inverse(self: any): any;
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
export interface ErrorWithCode extends Error {
    statusCode: number;
}
export interface ErrorModel extends Document {
    user: Types.ObjectId;
    userAgent: string;
    method: string;
    url: string;
    query: string;
    body: string;
    stack: string;
}
