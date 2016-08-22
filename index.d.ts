// /**
//  * Definition File
//  */
//
// interface FormatFn {
//     (returnValue:any):any;
// }
//
// interface Callback<T> {
//     (error?:Error, results?:T):void;
// }
//
// interface ErrorCallback {
//     (error:Error):void;
// }
//
// interface ErrorMessage {
//     [key: string] : {
//         message: string;
//     };
// }
//
// interface ValidationErrorObject {
//     field: string;
//     msg: string;
//     value?: any;
// }
//
// interface ErrorObject {
//     [key:string]: {
//         msg: string;
//         value: any;
//     }
// }
// export class ValidationError extends Error {
//
//     constructor(errors:ValidationErrorObject|ValidationErrorObject[]);
//     formatFormFieldErrors():ErrorObject;
// }
//
// export function hbHelperIsProd (options):void;
// export function setupResponseCallback<T>(res, formatFn?:FormatFn):Callback<T>;
// export function socialBot(req, res, next):void;
// export function createFormFieldErrorMessage(fieldName:string, message:string):ErrorMessage;
// export function handleSafariCaching (req, res, next:ErrorCallback):void;
//
//
