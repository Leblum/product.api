import { mongoose } from '../config/database/database';
import { Schema, Model, Document } from 'mongoose';
import { IBaseModel, IBaseModelDoc } from "./index";

export interface IPermission extends IBaseModel {
    name: String;
    description: String;
    value: string;
    href: string;
}

export interface IPermissionDoc extends IPermission, IBaseModelDoc {

}


export const PermissionSchema = new Schema({
    name: {type: String},
    description: {type: String},
    value: {type: String},
    href: {type: String},
},{timestamps:true});

//If you do any pre save methods, and you use fat arrow syntax 'this' doesn't refer to the document.
PermissionSchema.pre('save',function(next){
    //If there's any Permissions, this field requires validation.
    next();
});

export const Permission = mongoose.model<IPermissionDoc>('permission', PermissionSchema);