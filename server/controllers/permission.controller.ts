import { Permission, IPermission, IPermissionDoc } from '../models';
import mongoose = require('mongoose');
import { Schema, Model, Document } from 'mongoose';
import { BaseController } from './base/base.controller';
import { CONST } from '../constants';
import { PermissionRepository, IPermissionRepository } from '../repositories'

export class PermissionController extends BaseController {
  public defaultPopulationArgument = null;

  protected repository: IPermissionRepository = new PermissionRepository();

  constructor() {
    super();
  }

  public preCreateHook(model: IPermissionDoc): Promise<IPermissionDoc>{
    model.href = `${CONST.ep.API}${CONST.ep.PERMISSIONS}/${model._id}`;
    return Promise.resolve(model);
  }
}
