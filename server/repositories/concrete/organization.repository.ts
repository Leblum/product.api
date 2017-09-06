import { Organization, IOrganization, IOrganizationDoc } from "../../models/index";
import { BaseRepository } from '../base/base.repository';
import { IBaseRepository } from '../base/base.repository.interface';

import { Model } from "mongoose";
import { IOrganizationRepository } from "../index";

export class OrganizationRepository extends BaseRepository<IOrganizationDoc> implements IOrganizationRepository, IBaseRepository<IOrganizationDoc>{
    protected mongooseModelInstance: Model<IOrganizationDoc> = Organization;

    public constructor() {
        super();
    }

    public async getGuestOrganization(): Promise<IOrganizationDoc> {
        let guestOrg = await Organization.findOne({ name: 'guest' });
        return guestOrg;
    }
    
    public async getSystemOrganization(): Promise<IOrganizationDoc> {
        let systemOrg = await Organization.findOne({ name: 'system' });
        return systemOrg;
    }
}