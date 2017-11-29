import { mongoose } from '../../config/database/database';
import { Schema, Model, Document, model } from 'mongoose';
import { IBaseModel, IBaseModelDoc } from "../index";
import * as enums from "../../enumerations";
import { BijectionEncoder } from '../../utils/bijection-encoder';
import * as log from 'winston';
import { INewOrderNotification } from './order-related/new-order.notification.interface';
import { IOrderAcceptedNotification } from './order-related/order-accepted.notification.interface';
import { IOrderDeclinedNotification } from './order-related/order-declined.notification.interface';

export interface INotification extends IBaseModel {
    type: enums.NotificationType
    newOrderNotification?: INewOrderNotification,
    orderAcceptedNotification?: IOrderAcceptedNotification,
    orderDeclinedNotification?: IOrderDeclinedNotification,
    isRead?: boolean;
    readAt?: string;
    isActionable: boolean;
    isActionCompleted: boolean;
}

export interface INotificationDoc extends INotification, IBaseModelDoc {

}

export const NotificationSchema = new Schema({
    newOrderNotification: {
        order: {type: Schema.Types.ObjectId, ref: 'order'},
        supplier: {type: Schema.Types.ObjectId, ref: 'supplier'},
    },
    orderAcceptedNotification: {
        order: {type: Schema.Types.ObjectId, ref: 'order'},
        acceptedBy: {type: Schema.Types.ObjectId, ref: 'supplier'},
    },
    orderDeclinedNotification: {
        order: {type: Schema.Types.ObjectId, ref: 'order'},
        declinedBy: {type: Schema.Types.ObjectId, ref: 'supplier'},
    },
    type: { type: Number, enum: [enums.EnumHelper.getValuesFromEnum(enums.NotificationType)] },
    isRead: { type: Boolean, default: false },
    readAt: { type: String },
    isActionable: { type: Boolean },
    isActionCompleted: { type: Boolean },
}, { timestamps: true });

// This will compile the schema for the object, and place it in this Instance.
export const Notification = mongoose.model<INotificationDoc>('notification', NotificationSchema);   
