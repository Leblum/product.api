import { Router } from 'express';
import { AuthenticationController } from '../controllers/authentication.controller';
import { Request, Response, RequestHandler, } from 'express';
import { RequestHandlerParams, NextFunction } from 'express-serve-static-core';
import { BaseRouter } from './base/base.router';

export class AuthenticationRouter extends BaseRouter {
    public router: Router = Router();
    public controller = new AuthenticationController();
    public resource: string = '';

    public constructor() {
        super();
    }

    public getRouter(): Router {
        return this.router
            .post(`${this.resource}`, async (request: Request, response: Response, next: NextFunction) => {
                await this.controller.authenticate(request, response, next);
            })
            .post(`${this.resource}/refresh`, async (request: Request, response: Response, next: NextFunction) => {
                await this.controller.refreshToken(request, response, next);
            });
    }

    public authMiddleware(request: Request, response: Response, next: NextFunction): Response{
        return new AuthenticationController().authMiddleware(request,response,next);
    }
}