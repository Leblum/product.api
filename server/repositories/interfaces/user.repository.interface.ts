import { IUserDoc } from "../../models/index";
import { BaseRepository } from "../base/base.repository";
import { Model } from "mongoose";
import { IBaseRepository } from "../index";

export interface IUserRepository extends IBaseRepository<IUserDoc>{
    getUserForPasswordCheck(email: string): Promise<IUserDoc>;
    updatePassword(id: string, hashedPassword: string): Promise<IUserDoc>;
    findUserByEmail(email: string): Promise<IUserDoc>;
}