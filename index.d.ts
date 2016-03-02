/**
 * Definition File
 */
declare module "cc-express-utils" {

    interface FormatFn {
        (returnValue:any):any;
    }
    
    interface Callback<T> {
        (error?:Error, results?:T):void;
    }
    
    interface ErrorCallback {
        (error:Error):void;
    }

    interface ErrorMessage {
        [key: string] : {
            message: string;
        };
    }

    interface ValidationErrorObject {
        field: string;
        msg: string;
        value?: any;
    }

    interface ErrorObject {
        [key:string]: {
            msg: string;
            value: any;
        }
    }
    class ValidationError extends Error {

        constructor(errors:ValidationErrorObject|ValidationErrorObject[]);
        formatFormFieldErrors():ErrorObject;
    }

    interface CCExpressUtils  {

        hbHelperIsProd (options):void;
        setupResponseCallback<T>(res, formatFn:FormatFn):Callback<T>;
        socialBot(req, res, next):void;
        createFormFieldErrorMessage(fieldName:string, message:string):ErrorMessage;
        handleSafariCaching (req, res, next:ErrorCallback):void;
        ValidationError;
    }
    export = var ccExpressUtils: CCExpressUtils;
}
