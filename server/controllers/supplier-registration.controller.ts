import { ISupplier, Supplier, ITokenPayload, IBaseModel, ISupplierDoc, IUserUpgradeResponse } from '../models';
import { Router, Request, Response, RequestParamHandler, NextFunction, RequestHandler } from 'express';
import mongoose = require('mongoose');
import { Schema, Model, Document } from 'mongoose';
import { BaseController } from './base/base.controller';
import { CONST } from '../constants';
import { OwnershipType } from "../enumerations";
import { IOwnership } from "../models/ownership.interface";
import { AmazonS3Service, IdentityApiService } from '../services/index';
import * as log from 'winston';
import { ISupplierRepository, SupplierRepository } from '../repositories/index';
var bcrypt = require('bcrypt');

export class SupplierRegistrationController extends BaseController {

    public defaultPopulationArgument = {};

    public rolesRequiringOwnership = [];
    public isOwnershipRequired = false;

    protected repository: ISupplierRepository = new SupplierRepository();

    constructor() {
        super();
    }

    public async register(request: Request, response: Response, next: NextFunction): Promise<ISupplierDoc> {

        // Then we create the supplier.  We'll need to update the ownership with the organization we created on the 
        // identity api.
        //There's a bug here, the ownership will be to the guest organization.  I guess we can change that after the fact.
        let supplierDoc: ISupplierDoc = await super.create(request,response,next,false) as ISupplierDoc;

        // This call will upgrade the user to supplier editor role.  we also need to correct data on our end. 
        let upgradeResponse: IUserUpgradeResponse = await new IdentityApiService(CONST.ep.USERS + CONST.ep.UPGRADE).upgrade({
            organizationName: supplierDoc.name,
            userId: (request[CONST.REQUEST_TOKEN_LOCATION] as ITokenPayload).userId,
            roleName: CONST.SUPPLIER_EDITOR_ROLE,
        });

        // Now we should have back an organizationID, and we need to clean up the ownerships on that side of thing.
        supplierDoc.ownerships = [{
            ownerId: upgradeResponse.organizationId,
            ownershipType: OwnershipType.organization
        }];

        supplierDoc = await this.repository.save(supplierDoc);

        response.status(201).json(supplierDoc);
        log.info(`Registered new supplier Name: ${supplierDoc.name}`);
    
        return supplierDoc;
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