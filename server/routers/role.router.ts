import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';
import { BaseRouter } from './base/base.router';
import { CONST } from '../constants';

export class RoleRouter extends BaseRouter {
    public router: Router = Router();
    public controller = new RoleController();
    public resource: string;

    public constructor(){
        super();
        this.resource = CONST.ep.ROLES;
    }
}