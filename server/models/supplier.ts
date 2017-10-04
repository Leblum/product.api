import { mongoose } from '../config/database/database';
import { Schema, Model, Document, model } from 'mongoose';
import { IBaseModel, IBaseModelDoc, IAddress, IContact, IEmail } from "./index";
import * as enums from "../enumerations";
import { IOwnership } from "./ownership.interface";
import { IImage } from './image.interface';
import { IPhone } from './phone.interface';


export interface ISupplier extends IBaseModel {
    ownerships?: {
        ownerId: string,
        ownershipType: enums.OwnershipType
    }[],
    name:string,
    isApproved: boolean,
    isActive: boolean,
    addresses?: IAddress[],
    phones?: IPhone[],
    emails?: IEmail[],
    contact?: IContact[],
}

export interface ISupplierDoc extends ISupplier, IBaseModelDoc {

}

const SupplierSchema = new Schema({
    ownerships: [{
        _id: { auto: false },
        ownerId: { type: String },
        ownershipType: { type: Number, enum: [enums.EnumHelper.getValuesFromEnum(enums.OwnershipType)] },
    }],
    name: { type: String },
    emails: [{
        email: { type: String },
        emailType: { type: Number, enum: [enums.EnumHelper.getValuesFromEnum(enums.EmailType)] },
    }],
    phones: [{
        phone: { type: String },
        phoneType: { type: Number, enum: [enums.EnumHelper.getValuesFromEnum(enums.PhoneType)] },
    }],
    addresses: [{
        street1: { type: String },
        street2: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        province: { type: String },
        countryCode: { type: String },
        zip: { type: String },
        addressType: { type: Number, enum: [enums.EnumHelper.getValuesFromEnum(enums.AddressType)] },
    }],
    contacts: [{ type : Schema.Types.ObjectId, ref: 'contact' }],
    isApproved: { type: Boolean, required: true, default: false },
    isActive: { type: Boolean, required: true, default: true },
}, { timestamps: true });

//If you do any pre save methods, and you use fat arrow syntax 'this' doesn't refer to the document.
SupplierSchema.pre('save', function (next) {
    //If there's any validators, this field requires validation.
    next();
});

// This will compile the schema for the object, and place it in this Instance.
export const Supplier = mongoose.model<ISupplierDoc>('supplier', SupplierSchema);