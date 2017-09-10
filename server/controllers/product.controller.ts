import { IProductDoc, Product } from '../models';
import { Router, Request, Response, RequestParamHandler, NextFunction, RequestHandler } from 'express';
import mongoose = require('mongoose');
import { Schema, Model, Document } from 'mongoose';
import { BaseController } from './base/base.controller';
import { CONST } from '../constants';
import { IProductRepository, ProductRepository } from "../repositories";
var bcrypt = require('bcrypt');

export class ProductController extends BaseController {
  public defaultPopulationArgument = null;

  protected repository: IProductRepository = new ProductRepository();

  constructor() {
    super();
  }

  public async CreateProductFromTemplate(request: Request, response: Response, next: NextFunction): Promise<IProductDoc> {
    try {
      // TODO: Check that they have the correct role.
      // Create a new product.  The false here at the end of the create request allows us to not send the product back in a response just yet.
      // We need to get the product id off the product that was passed in, so that we can use it as our "master product id reference"
      let productTemplate: IProductDoc = this.repository.createFromBody(request.body)

      // Let the base class handle creation for us.
      let newProduct: IProductDoc = await super.create(request, response, next, false) as IProductDoc;

      // Change the product to no longer be a template
      newProduct.isTemplate = false;
      newProduct.masterProductId = productTemplate.id;

      // Save the update to the database
      await newProduct.save();

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
