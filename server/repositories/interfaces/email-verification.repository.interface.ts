import { IEmailVerification } from "../../models/";
import { BaseRepository } from "../base/base.repository";
import { Model } from "mongoose";
import { IBaseRepository } from "../";
import { IEmailVerificationDoc } from "../../models/";

export interface IEmailVerificationRepository extends IBaseRepository<IEmailVerificationDoc>{
    getEmailVerificationById(name: string): Promise<IEmailVerification>;
}