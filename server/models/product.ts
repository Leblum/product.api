import { mongoose } from '../config/database/database';
import { Schema, Model, Document, model } from 'mongoose';
import { IBaseModel, IBaseModelDoc } from "./index";
import { EnumHelper, ProductType, PrimaryColor } from "../enumerations";


export interface IProduct extends IBaseModel {
    displayName?: string,
    commonName?: string,
    shortDescription?: string,
    longDescription?: string,
    thumbnailDescription?: string,
    organizationId?: string,
    supplierId?: string,
    type?: number,
    category?: string,
    tags?: [string],
    isTemplate: boolean,
    isLocal: boolean,
    masterProductId: string,
    sku?: string,
    primaryColor?: number,
    productLocation?: [number],
    deliveryOptions?: {
        personalPickup?: {
            pickupLocation?: [number],
        },
        supplierDelivery?: {
            serviceZipCodes?: [number],
            serviceRadius?: number
        },
        courierDelivery?: {
            serviceZipCodes?: [number]
        }
    },
    reviews?: {
        customerEmail?: string,
        customerFirstName?: string,
        customerLastName?: string,
        customerUserId?: string,
        createdDate?: Date,
        rating?: number,
        purchaseDate?: Date,
        message?: string,
        isVerified?: boolean,
        isActive?: boolean,
        sellerResponse?: {
            name?: string,
            message?: string,
            responseDate?: Date,
        }
    },
    sizes?: [string],
    weights?: [string],
    cutDate?: Date,
    combinedWith?: [string],
    similarTo?: [string],
    pricing?: {
        supplier?: {
            perStem?: number,
            markdownPercentage?: number,
            stemsPerBundle?: number
        },
        markupPercentage?: number,
        industryPrice?: number,
        meanPrice?: number
    },
    lastUpdated?: Date,
    active?: {
        startDate?: Date,
        endDate?: Date,
    },
    images?: [{
        type?: number,
        url?: string,
        width?: number,
        height?: number,
        order?: number,
        isActive?: boolean
    }],
    version?: string,
    stemAttributes?: {
        version?: string,
        latinName?: string,
        varietal?: string,
        nickname?: string,
        grade?: string,
        stemLength?: string,
        grams?: number,
        inflorescence?: string,
        bloomSize?: string,
        bloomsPerStem?: string,
        lifespan?: string,
        season?: string,
    }
    href: string,
    createdAt?: Date; //Automatically created by mongoose.
    modifiedAt?: Date; //Automatically created by mongoose.
}

export interface IProductDoc extends IProduct, IBaseModelDoc {

}

const ProductSchema = new Schema({
    displayName: { type: String },
    commonName: { type: String },
    shortDescription: { type: String },
    longDescription: { type: String },
    thumbnailDescription: { type: String },
    organizationId: { type: Schema.Types.ObjectId },
    supplierId: { type: Schema.Types.ObjectId },
    type: { type: Number, enum: [EnumHelper.getValuesFromEnum(ProductType)] },
    category: { type: String },
    tags: { type: [String] },
    isTemplate: { type: Boolean, required: true, default: false },
    isLocal: { type: Boolean },
    masterProductId: { type: Schema.Types.ObjectId },
    sku: { type: String },
    primaryColor: { type: Number, enum: [EnumHelper.getValuesFromEnum(PrimaryColor)] },
    productLocation: { type: [Number], index: '2dsphere' }, // This might cause issues, but we'll see.
    deliveryOptions: {
        personalPickup: {
            pickupLocation: { type: [Number], index: '2dsphere' }
        },
        supplierDelivery: {
            serviceZipCodes: { type: [Number] },
            serviceRadius: { type: Number, require: false }
        },
        courierDelivery: {
            serviceZipCodes: { type: [Number] }
        }
    },
    reviews: {
        customerEmail: { type: String },
        customerFirstName: { type: String },
        customerLastName: { type: String },
        customerUserId: { type: Schema.Types.ObjectId },
        createdDate: { type: Date },
        rating: { type: Number },
        purchaseDate: { type: Date },
        message: { type: String },
        isVerified: { type: Boolean },
        isActive: { type: Boolean },
        sellerResponse: {
            name: { type: String },
            message: { type: String },
            responseDate: { type: Date },
        }
    },
    sizes: { type: [String] },
    weights: { type: [String] },
    cutDate: { type: Date },
    combinedWith: { type: [Schema.Types.ObjectId] },
    similarTo: { type: [Schema.Types.ObjectId] },
    pricing: {
        supplier: {
            perStem: { type: Number },
            markdownPercentage: { type: Number },
            stemsPerBundle: { type: Number }
        },
        markupPercentage: { type: Number },
        industryPrice: { type: Number },
        meanPrice: { type: Number }
    },
    lastUpdated: { type: Date, default: Date.now },
    active: {
        startDate: { type: Date },
        endDate: { type: Date },
    },
    images: [{
        type: { type: Number, enum: [EnumHelper.getValuesFromEnum(ProductType)] },
        url: { type: String },
        width: { type: Number },
        height: { type: Number },
        order: { type: Number },
        isActive: { type: Boolean }
    }],
    version: { type: String },
    stemAttributes: {
        version: { type: String },
        latinName: { type: String },
        varietal: { type: String },
        nickname: { type: String },
        grade: { type: String },
        stemLength: { type: String },
        grams: { type: Number },
        inflorescence: { type: String },
        bloomSize: { type: String },
        bloomsPerStem: { type: String },
        lifespan: { type: String },
        season: { type: String },
    },
    href: {type: String }
}, { timestamps: true });

//If you do any pre save methods, and you use fat arrow syntax 'this' doesn't refer to the document.
ProductSchema.pre('save', function (next) {
    //If there's any validators, this field requires validation.
    next();
});

// This will compile the schema for the object, and place it in this Instance.
export const Product = mongoose.model<IProductDoc>('product', ProductSchema);