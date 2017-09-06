import { IOrganization } from "../../models/index";
import { BaseRepository } from "../base/base.repository";
import { Model } from "mongoose";
import { IBaseRepository } from "../index";
import { IOrganizationDoc } from "../../models/organization";

export interface IOrganizationRepository extends IBaseRepository<IOrganizationDoc>{
    getGuestOrganization(): Promise<IOrganizationDoc>;
    getSystemOrganization(): Promise<IOrganizationDoc>;
}