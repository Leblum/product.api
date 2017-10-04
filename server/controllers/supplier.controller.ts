import { ISupplier, Supplier, ITokenPayload, IBaseModel, ISupplierDoc } from '../models';
import { Router, Request, Response, RequestParamHandler, NextFunction, RequestHandler } from 'express';
import mongoose = require('mongoose');
import { Schema, Model, Document } from 'mongoose';
import { BaseController } from './base/base.controller';
import { CONST } from '../constants';
import { OwnershipType } from "../enumerations";
import { IOwnership } from "../models/ownership.interface";
import { AmazonS3Service } from '../services/index';
import * as log from 'winston';
import { ISupplierRepository, SupplierRepository } from '../repositories/index';
var bcrypt = require('bcrypt');

export class SupplierController extends BaseController {

  public defaultPopulationArgument = 
  {
    path: 'contacts'
  };
  
  public rolesRequiringOwnership = ["supplier:editor"];
  public isOwnershipRequired = true;

  protected repository: ISupplierRepository = new SupplierRepository();

  constructor() {
    super();
  }

  // This will add ownerships whenever a document is created.
  // Here we can later add supplier ID, and also check that supplier ID in the checking logic.
  public addOwnerships(request: Request, response: Response, next: NextFunction, supplierDoc: ISupplierDoc): void {
    let currentToken: ITokenPayload = request[CONST.REQUEST_TOKEN_LOCATION];
    supplierDoc.ownerships = [{
      ownerId: currentToken.organizationId,
      ownershipType: OwnershipType.organization
    }];
  }

  // For product documents we're going to test ownership based on organization id,
  // although we need to be testing based on supplier id as well.
  // TODO check ownership on supplier ID.
  public isOwner(request: Request, response: Response, next: NextFunction, supplierDoc: ISupplierDoc): boolean {
    // We'll assume this is only for CRUD
    // Get the current token, so we can get the ownerId in this case organization id off of here.
    let currentToken: ITokenPayload = request[CONST.REQUEST_TOKEN_LOCATION];

    // For now we're just going to check that the ownership is around organization.
    return super.isOwnerInOwnership(supplierDoc, currentToken.organizationId, OwnershipType.organization);
  }

  public async preCreateHook(supplier: ISupplierDoc): Promise<ISupplierDoc> {
    //supplier.href = `${CONST.ep.API}${CONST.ep.V1}${CONST.ep.SUPPLIERS}/${supplier._id}`;
    return supplier;
  }

  public async preSendResponseHook(supplier: ISupplierDoc): Promise<ISupplierDoc> {
    return supplier;
  }
}
