import { Router } from 'express';
import { AuthenticationController } from '../controllers/authentication.controller';
import { Request, Response, RequestHandler, } from 'express';
import { RequestHandlerParams, NextFunction } from 'express-serve-static-core';
import { BaseRouter } from './base/base.router';
import { RegistrationController } from "../controllers/registration.controller";

export class RegistrationRouter extends BaseRouter {
    public router: Router = Router();
    public controller = new RegistrationController();
    public resource: string = '';

    public constructor() {
        super();
    }

    public getRouter(): Router {
        return this.router
            .post(`${this.resource}`, async (request: Request, response: Response, next: NextFunction) => {
                await this.controller.register(request, response, next);
            })
    }
}