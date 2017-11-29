import { IOrder, ISupplier } from "../../index";
import { IOrderNotificationBase } from "./order-notification-base.interface";

export interface IOrderDeclinedNotification extends IOrderNotificationBase{
    acceptedBy?: ISupplier
}