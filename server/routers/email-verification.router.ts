import { Router } from 'express';
import { EmailVerificationController } from '../controllers/';
import { BaseRouter } from './base/base.router';
import { CONST } from '../constants';
import { Request, Response, RequestHandler, } from 'express';
import { RequestHandlerParams, NextFunction } from 'express-serve-static-core';

export class EmailVerificationRouter extends BaseRouter {
    public router: Router = Router();
    public controller = new EmailVerificationController();
    public resource: string;

    public constructor(){
        super();
        this.resource = CONST.ep.EMAIL_VERIFICATIONS;
    }

    public getPublicRouter(): Router {
        return this.router
            .post(``, async (request: Request, response: Response, next: NextFunction) => {
                await this.controller.validateEmail(request, response, next);
            });
    }
}