import { EmailVerification, IEmailVerification } from "../../models/index";
import {BaseRepository} from '../base/base.repository';
import {IBaseRepository} from '../base/base.repository.interface';

import { Model } from "mongoose";
import { IEmailVerificationRepository } from "../index";
import { IEmailVerificationDoc } from "../../models/index";

export class EmailVerificationRepository extends BaseRepository<IEmailVerificationDoc> implements IEmailVerificationRepository, IBaseRepository<IEmailVerificationDoc>{
    protected mongooseModelInstance: Model<IEmailVerificationDoc> = EmailVerification;

    public constructor(){
        super();
    }

    public async getEmailVerificationById(id: string): Promise<IEmailVerification>{
        return await EmailVerification.findById(id);
    }
}