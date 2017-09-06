import { Schema, Model, Document } from 'mongoose';

export interface IBaseModel {
    createdBy?: string;
    modifiedBy?: string;
    createdAt?: Date,
    modifiedAt?: Date,
}