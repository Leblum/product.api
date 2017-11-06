import { IOrder, Order, ITokenPayload, IBaseModel, IOrderDoc, IValidationError } from '../models';
import { Router, Request, Response, RequestParamHandler, NextFunction, RequestHandler } from 'express';
import mongoose = require('mongoose');
import { Schema, Model, Document } from 'mongoose';
import { BaseController } from './base/base.controller';
import { CONST } from '../constants';
import { OwnershipType } from "../enumerations";
import { IOwnership } from "../models/ownership.interface";
import { AmazonS3Service } from '../services/index';
import * as log from 'winston';
import { IOrderRepository, OrderRepository } from '../repositories/index';
import { ApiErrorHandler } from '../api-error-handler';
import * as enums from '../enumerations';
import { FirebaseService } from '../services/firebase.service';

export class OrderController extends BaseController {

  public defaultPopulationArgument = {
    // This will populate both the supplier on the document, and also the product.
    // in the future this might be a problem as the product document is pretty big.
    path: 'supplier items.product',
    //select: 'displayName images',
    // populate: {
    //   path: 'items.product',
    //   select: 'displayName images'
    // }
  };

  public rolesRequiringOwnership = [];
  public isOwnershipRequired = false;

  protected repository: IOrderRepository = new OrderRepository();

  constructor() {
    super();
  }

  public async send(request: Request, response: Response, next: NextFunction): Promise<IOrderDoc> {
    // here we're going to change the order status to sent,
    // and also fire off a push notification. 
    try {
      if (await this.isModificationAllowed(request, response, next)) {

        let order: IOrderDoc = await this.repository.single(this.getId(request), this.defaultPopulationArgument);
        if (!order)
          throw ({ message: 'Order Not Found', status: 404 });

        //Now we take the supplier off the order, and send a notification to his push tokens.
        if (order.supplier && order.supplier.pushTokens) {
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
        };

        order.status = enums.OrderStatus.sent;

        response.status(202).json(order);
        log.info(`Updated a: ${this.repository.getCollectionName()}, ID: ${order._id}, Order status changed to sent.`);
        return order;
      }
    }
    catch (error) { next(error); }
  }

  public accept(request: Request, response: Response, next: NextFunction): Promise<IOrderDoc> {
    return null;
  }

  public reject(request: Request, response: Response, next: NextFunction): Promise<IOrderDoc> {
    return null;
  }

  public pickup(request: Request, response: Response, next: NextFunction): Promise<IOrderDoc> {
    return null;
  }

  public complete(request: Request, response: Response, next: NextFunction): Promise<IOrderDoc> {
    return null;
  }

  // This will add ownerships whenever a document is created.
  // Here we can later add order ID, and also check that order ID in the checking logic.
  public addOwnerships(request: Request, response: Response, next: NextFunction, orderDoc: IOrderDoc): void {
    return;
  }

  // For product documents we're going to test ownership based on organization id,
  // although we need to be testing based on order id as well.
  // TODO check ownership on order ID.
  public isOwner(request: Request, response: Response, next: NextFunction, orderDoc: IOrderDoc): boolean {
    return true;
  }
}
