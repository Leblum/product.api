import { IOrder, Order, IBaseModel, IOrderDoc, IValidationError } from '../models';
import { Router, Request, Response, RequestParamHandler, NextFunction, RequestHandler } from 'express';
import mongoose = require('mongoose');
import { Schema, Model, Document } from 'mongoose';
import { CONST } from '../constants';
import { OwnershipType } from "../enumerations";
import { IOwnership } from "../models/ownership.interface";
import { AmazonS3Service } from '../services/index';
import * as log from 'winston';
import { IOrderRepository, OrderRepository } from '../repositories/index';
import { ApiErrorHandler } from '../api-error-handler';
import { FirebaseService } from '../services/firebase.service';
import * as admin from 'firebase-admin';
import * as enums from '../enumerations';

export class OrderNotification {

    // This is where we're going to be sending a notification to the supplier asking
    // them to accept the order, or decline the order
    public static async PushToSupplierOnSend(order: IOrderDoc): Promise<admin.messaging.MessagingDevicesResponse> {
        //Now we take the supplier off the order, and send a notification to his push tokens.
        if (order.supplier && order.supplier.pushTokens && order.supplier.pushTokens.length > 0) {
            let pushResponse = await FirebaseService.sendNotification(order.supplier.pushTokens, {
                notification: {
                    title: 'New order request',
                    message: 'An order has been sent to you.  Can you fulfill this order?'
                },
                data: {
                    location: `/order-detail/${order._id}`,
                    id: `${order._id}`,
                    //Firebase freaks out if the value here isn't a string.  So we have to convert it before we send the notification.
                    type: enums.PushNotificationType.orderSent.toString(),
                }
            });
            if (pushResponse.successCount !== order.supplier.pushTokens.length) {
                log.error('There were some errors while sending push notifications to a supplier.  The count of tokens, and success count dont match');
            }

            return pushResponse;
        };
    }

}