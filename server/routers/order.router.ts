import { Router } from 'express';
import { OrderController } from '../controllers/';
import { Request, Response, RequestHandler, } from 'express';
import { RequestHandlerParams, NextFunction } from 'express-serve-static-core';
import { BaseRouter } from './base/base.router';
import { CONST } from '../constants';
import { Authz } from '../controllers/authorization';

export class OrderRouter extends BaseRouter {
    public router: Router = Router();
    public controller = new OrderController();
    public resource: string;

    public constructor(){
        super();
        this.resource = CONST.ep.ORDERS;
    }
}