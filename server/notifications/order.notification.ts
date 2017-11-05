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

export class OrderNotification{

    // This is where we're going to be sending a notification to the supplier asking
    // them to accept the order, or decline the order
    public send(order: IOrderDoc){
        
    }

}