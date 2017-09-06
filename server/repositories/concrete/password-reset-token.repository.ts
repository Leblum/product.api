import { PasswordResetToken, IPasswordResetToken } from "../../models/index";
import {BaseRepository} from '../base/base.repository';
import {IBaseRepository} from '../base/base.repository.interface';

import { Model } from "mongoose";
import { IPasswordResetTokenRepository } from "../index";
import { IPasswordResetTokenDoc } from "../../models/index";

export class PasswordResetTokenRepository extends BaseRepository<IPasswordResetTokenDoc> implements IPasswordResetTokenRepository, IBaseRepository<IPasswordResetTokenDoc>{
    protected mongooseModelInstance: Model<IPasswordResetTokenDoc> = PasswordResetToken;

    public constructor(){
        super();
    }

    public async getPasswordResetTokenById(id: string): Promise<IPasswordResetToken>{
        return await PasswordResetToken.findById(id);
    }
}