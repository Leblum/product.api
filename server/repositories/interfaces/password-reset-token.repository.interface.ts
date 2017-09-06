import { IPasswordResetToken } from "../../models/";
import { BaseRepository } from "../base/base.repository";
import { Model } from "mongoose";
import { IBaseRepository } from "../";
import { IPasswordResetTokenDoc } from "../../models/";

export interface IPasswordResetTokenRepository extends IBaseRepository<IPasswordResetTokenDoc>{
    getPasswordResetTokenById(name: string): Promise<IPasswordResetToken>;
}