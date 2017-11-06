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

  public send(request: Request, response: Response, next: NextFunction): Promise<IOrderDoc>{
    return null;
  }

  public accept(request: Request, response: Response, next: NextFunction): Promise<IOrderDoc>{
    return null;
  }

  public reject(request: Request, response: Response, next: NextFunction): Promise<IOrderDoc>{
    return null;
  }

  public pickup(request: Request, response: Response, next: NextFunction): Promise<IOrderDoc>{
    return null;
  }

  public complete(request: Request, response: Response, next: NextFunction): Promise<IOrderDoc>{
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
