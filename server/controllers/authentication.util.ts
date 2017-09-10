import { IProduct, Product } from "../models";
import { Config } from "../config/config";
import { CONST } from "../constants";
import { OrganizationType } from "../enumerations";

import * as identityApi from "superagent";

const util = require('util');
var bcrypt = require('bcrypt');
import log = require('winston');
import { Router, Request, Response, RequestParamHandler, NextFunction, RequestHandler, Application } from 'express';
import { IdentityApiService } from "../services/identity.api.service";

export class AuthenticationUtil {

    public static sendAuthFailure(response: Response, status: number, description: string): Response {
        return response.status(status).json({
            message: 'Authentication Failed',
            description: description
        });
    }

    // // TODO make this smarter.  Singleton, and refresh token whenever it's close to expiring
    // public static async getSystemUserToken(): Promise<string> {
    //     return await IdentityApiService.authenticateUser("system@leblum.com", Config.active.get('systemUserPassword'));
    // }
}