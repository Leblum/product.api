import { IUserDoc, User } from '../models';
import { Router, Request, Response, RequestParamHandler, NextFunction, RequestHandler } from 'express';
import mongoose = require('mongoose');
import { Schema, Model, Document } from 'mongoose';
import { BaseController } from './base/base.controller';
import { CONST } from '../constants';
import { IUserRepository, UserRepository } from "../repositories";
var bcrypt = require('bcrypt');

export class UserController extends BaseController {
  public defaultPopulationArgument =
  {
    path: 'roles',
    // Permissions for the roles
    populate: { path: 'permissions' }
  };

  protected repository: IUserRepository = new UserRepository();

  constructor() {
    super();
  }

  public async preCreateHook(user: IUserDoc): Promise<IUserDoc> {
    user.href = `${CONST.ep.API}${CONST.ep.USERS}/${user._id}`;
    user.password = await bcrypt.hash(user.password, CONST.SALT_ROUNDS);
    return user;
  }

  public async preSendResponseHook(user: IUserDoc): Promise<IUserDoc> {
    user.password = '';
    return user;
  }
}
