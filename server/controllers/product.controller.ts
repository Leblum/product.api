import { IProductDoc, Product } from '../models';
import { Router, Request, Response, RequestParamHandler, NextFunction, RequestHandler } from 'express';
import mongoose = require('mongoose');
import { Schema, Model, Document } from 'mongoose';
import { BaseController } from './base/base.controller';
import { CONST } from '../constants';
import { IProductRepository, ProductRepository } from "../repositories";
var bcrypt = require('bcrypt');

export class ProductController extends BaseController {
  public defaultPopulationArgument =
  {
  };

  protected repository: IProductRepository = new ProductRepository();

  constructor() {
    super();
  }

  public async CreateProductFromTemplate(request, response, next): Promise<IProductDoc> {
    // We need to determine what kind of request this is going to be.  Do we want a full product document?
    // We need to check the users roles, and see if they have the right things on their token to do this.
    // First check they have a role of product editor - this will be given to suppliers
    // next check that they have a supplier id on their token (We'll come back to this when the supplier api is built.)
    // now use the repository to get the single product from the database.
    // update any fields we got from the request
    // tag the product with the supplier, and organization id from the token
    // save as a new product
    return new Product();
    // First find the product id from the request.
    // Next check that 
  }

  public async preCreateHook(Product: IProductDoc): Promise<IProductDoc> {
    Product.href = `${CONST.ep.API}${CONST.ep.PRODUCTS}/${Product._id}`;
    return Product;
  }

  public async preSendResponseHook(Product: IProductDoc): Promise<IProductDoc> {
    return Product;
  }
}
