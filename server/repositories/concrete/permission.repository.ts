import { Permission, IPermission } from "../../models/index";
import { IPermissionRepository, } from "../interfaces/permission.repository.interface";
import {BaseRepository} from '../base/base.repository';
import {IBaseRepository} from '../base/base.repository.interface';
import { Model } from "mongoose";
import { IPermissionDoc } from "../../models/permission";

export class PermissionRepository extends BaseRepository<IPermissionDoc> implements IPermissionRepository, IBaseRepository<IPermissionDoc>{
    protected mongooseModelInstance: Model<IPermissionDoc> = Permission;

    public constructor(){
        super();
    }
}