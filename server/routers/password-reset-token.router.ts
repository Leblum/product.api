import { Router } from 'express';
import { PasswordResetTokenController } from '../controllers/';
import { BaseRouter } from './base/base.router';
import { CONST } from '../constants';
import { Request, Response, RequestHandler, } from 'express';
import { RequestHandlerParams, NextFunction } from 'express-serve-static-core';

export class PasswordResetTokenRouter extends BaseRouter {
    public router: Router = Router();
    public controller = new PasswordResetTokenController();
    public resource: string;

    public constructor(){
        super();
        this.resource = CONST.ep.PASSWORD_RESET_TOKENS;
    }

    public getPublicRouter(): Router {
        return this.router
            .post(`${CONST.ep.PASSWORD_RESET}`, async (request: Request, response: Response, next: NextFunction) => {
                await this.controller.resetPassword(request, response, next);
            })
            .post(`${CONST.ep.PASSWORD_RESET_REQUEST}`, async (request: Request, response: Response, next: NextFunction) => {
                await this.controller.requestPasswordReset(request, response, next);
            });
    }
}