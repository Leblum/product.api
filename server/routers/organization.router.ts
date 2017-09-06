import { Router } from 'express';
import { OrganizationController } from '../controllers/organization.controller';
import { BaseRouter } from './base/base.router';
import { CONST } from '../constants';

export class OrganizationRouter extends BaseRouter {
    public router: Router = Router();
    public controller = new OrganizationController();
    public resource: string;

    public constructor(){
        super();
        this.resource = CONST.ep.ORGANIZATIONS;
    }
}