import { Role, IRole, IRoleDoc } from '../models';
import mongoose = require('mongoose');
import { Schema, Model, Document } from 'mongoose';
import { BaseController } from './base/base.controller';
import { CONST } from '../constants';
import { RoleRepository, IRoleRepository } from '../repositories'

export class RoleController extends BaseController{
  public defaultPopulationArgument =
  {
    path: 'permissions'
  }

  protected repository: IRoleRepository = new RoleRepository();

  constructor() {
    super();
  }

  public preCreateHook(model: IRoleDoc): Promise<IRoleDoc>{
    model.href = `${CONST.ep.API}${CONST.ep.ROLES}/${model._id}`;
    return Promise.resolve(model);
  }
}
