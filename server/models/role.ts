import { mongoose } from '../config/database/database';
import { Schema, Model, Document } from 'mongoose';
import { IPermission, PermissionSchema } from './permission';
import { IBaseModel, IBaseModelDoc } from "./index";

export interface IRole extends IBaseModel  {
    name: string;
    description: string;
    permissions: Array<IPermission>;
    href: string;
    createdAt?: Date; //Automatically created by mongoose.
    modifiedAt?: Date; //Automatically created by mongoose.
}

export interface IRoleDoc extends IRole, IBaseModelDoc {

}

const RoleSchema = new Schema({
    name: {type: String},
    description: {type: String},
    href: {type: String},
    permissions: [{type: Schema.Types.ObjectId, ref: 'permission'}]
},{timestamps:true});

//If you do any pre save methods, and you use fat arrow syntax 'this' doesn't refer to the document.
RoleSchema.pre('save',function(next){
    //If there's any validators, this field requires validation.
    next();
});

export const Role = mongoose.model<IRoleDoc>('role', RoleSchema);