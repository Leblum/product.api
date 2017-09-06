import { IRole } from "../../models/index";
import { BaseRepository } from "../base/base.repository";
import { Model } from "mongoose";
import { IBaseRepository } from "../index";
import { IRoleDoc } from "../../models/role";

export interface IRoleRepository extends IBaseRepository<IRoleDoc>{
    getRoleByName(name: string): Promise<IRole>;
}