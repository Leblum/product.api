import { Role, IRole } from "../../models/index";
import {BaseRepository} from '../base/base.repository';
import {IBaseRepository} from '../base/base.repository.interface';

import { Model } from "mongoose";
import { IRoleRepository } from "../index";
import { IRoleDoc } from "../../models/role";

export class RoleRepository extends BaseRepository<IRoleDoc> implements IRoleRepository, IBaseRepository<IRoleDoc>{
    protected mongooseModelInstance: Model<IRoleDoc> = Role;

    public constructor(){
        super();
    }

    public async getRoleByName(name: string): Promise<IRole>{
        return await Role.findOne({name: name});
    }
}