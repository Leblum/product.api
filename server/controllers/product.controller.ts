import { IProductDoc, Product, ITokenPayload, IBaseModel, IProduct } from '../models';
import { Router, Request, Response, RequestParamHandler, NextFunction, RequestHandler } from 'express';
import mongoose = require('mongoose');
import { Schema, Model, Document } from 'mongoose';
import { BaseController } from './base/base.controller';
import { CONST } from '../constants';
import { IProductRepository, ProductRepository } from "../repositories";
import { OwnershipType } from "../enumerations";
import { IOwnership } from "../models/ownership.interface";
var bcrypt = require('bcrypt');

export class ProductController extends BaseController {

  public defaultPopulationArgument = null;
  public rolesRequiringOwnership = ["product:editor"];
  public isOwnershipRequired = true;

  protected repository: IProductRepository = new ProductRepository();

  constructor() {
    super();
  }

  // This will add ownerships whenever a document is created.
  // Here we can later add supplier ID, and also check that supplier ID in the checking logic.
  public addOwnerships(request: Request, response: Response, next: NextFunction, productDocument: IProductDoc ): void {
    let currentToken: ITokenPayload = request[CONST.REQUEST_TOKEN_LOCATION];
    productDocument.ownerships = [{
      ownerId: currentToken.organizationId,
      ownershipType: OwnershipType.organization
    }];
  }

  // For product documents we're going to test ownership based on organization id,
  // although we need to be testing based on supplier id as well.
  // TODO check ownership on supplier ID.
  public isOwner(request: Request, response: Response, next: NextFunction, productDocument: IProductDoc): boolean {
    // We'll assume this is only for CRUD
    // Get the current token, so we can get the ownerId in this case organization id off of here.
    let currentToken: ITokenPayload = request[CONST.REQUEST_TOKEN_LOCATION];

    // For now we're just going to check that the ownership is around organization.
    return super.isOwnerInOwnership(productDocument, currentToken.organizationId, OwnershipType.organization);
  }

  public async CreateProductFromTemplate(request: Request, response: Response, next: NextFunction): Promise<IProductDoc> {
    try {
        // Create a new product.  The false here at the end of the create request allows us to not send the product back in a response just yet.
        // We need to get the product id off the product that was passed in, so that we can use it as our "master product id reference"
        let templateId = this.getId(request);
        let productTemplate: IProductDoc = await this.repository.single(templateId);

        // This allows us to basically create a clone of the existing document.
        productTemplate.isNew = true;
        productTemplate._id = mongoose.Types.ObjectId();

        request.body = productTemplate;

        // Let the base class handle creation for us, but don't return the response back just yet.
        // Ownership will also be changed, and created by the base class.
        let newProduct: IProductDoc = await super.create(request, response, next, false) as IProductDoc;

        // Change the product to no longer be a template
        newProduct.isTemplate = false;
        newProduct.masterProductId = templateId;

        // Save the update to the database
        await this.repository.save(newProduct);

        // Send the new product which is not a template back.
        response.status(201).json(newProduct);

        return newProduct;
    } catch (err) { next(err); }
  }

  public async preCreateHook(Product: IProductDoc): Promise<IProductDoc> {
    Product.href = `${CONST.ep.API}${CONST.ep.V1}${CONST.ep.PRODUCTS}/${Product._id}`;
    return Product;
  }

  public async preSendResponseHook(Product: IProductDoc): Promise<IProductDoc> {
    return Product;
  }
}
