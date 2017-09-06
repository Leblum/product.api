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

  public async preCreateHook(Product: IProductDoc): Promise<IProductDoc> {
    Product.href = `${CONST.ep.API}${CONST.ep.PRODUCTS}/${Product._id}`;
    return Product;
  }

  public async preSendResponseHook(Product: IProductDoc): Promise<IProductDoc> {
    return Product;
  }
}
