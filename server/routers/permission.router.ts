import { Router } from 'express';
import { PermissionController } from '../controllers/permission.controller';
import { BaseRouter } from './base/base.router';
import { CONST } from '../constants';

export class PermissionRouter extends BaseRouter {
    public router: Router = Router();
    public controller = new PermissionController();
    public resource: string;

    public constructor(){
        super();
        this.resource = CONST.ep.PERMISSIONS;
    }
}