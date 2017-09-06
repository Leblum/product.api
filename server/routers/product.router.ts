import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { BaseRouter } from './base/base.router';
import { CONST } from '../constants';

export class ProductRouter extends BaseRouter {
    public router: Router = Router();
    public controller = new ProductController();
    public resource: string;

    public constructor(){
        super();
        this.resource = CONST.ep.PRODUCTS;
    }
}