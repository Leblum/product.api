import { User, IUserDoc } from "../../models/index";
import { Model } from "mongoose";
import { BaseRepository } from '../base/base.repository';
import { IBaseRepository } from '../base/base.repository.interface';
import { IUserRepository } from '../interfaces/user.repository.interface';

export class UserRepository extends BaseRepository<IUserDoc> implements IUserRepository, IBaseRepository<IUserDoc> {
    protected mongooseModelInstance: Model<IUserDoc> = User;
    public constructor() {
        super();
    }

    public async findUserByEmail(email: string): Promise<IUserDoc>{
        return await this.mongooseModelInstance.findOne({email: email});
    }

    public async getUserForPasswordCheck(email: string): Promise<IUserDoc> {
        return await this.mongooseModelInstance.findOne({ email: email })
            .populate({
                path: 'roles',
                // Permissions for the roles
                populate: { path: 'permissions' }
            })
            .select('+password');
    }

    public async updatePassword(id: string, hashedPassword: string): Promise<IUserDoc> {
        let user: IUserDoc = await this.mongooseModelInstance.findById(id).select('+password');
        user.password = hashedPassword;
        return await user.save();
    }
}