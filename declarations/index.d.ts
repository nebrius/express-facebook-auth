/// <reference types="express" />
import * as express from 'express';
export interface IOptions {
    facebookAppId: string;
    facebookAppSecret: string;
    isUserRegistered: (facebookId: string) => boolean;
    loginUri: string;
    redirectUri: string;
}
export declare class Authenticator {
    constructor(opt: IOptions);
    createLoginSuccessEndpoint(app: express.Express): void;
    createMiddleware(redirect: boolean): express.RequestHandler;
}
