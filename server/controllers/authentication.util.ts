import { IProduct, Product } from "../models";
import { Config } from "../config/config";
import { CONST } from "../constants";
import { OrganizationType } from "../enumerations";

import * as identityApi from "superagent";

const util = require('util');
var bcrypt = require('bcrypt');
import log = require('winston');
import { Router, Request, Response, RequestParamHandler, NextFunction, RequestHandler, Application } from 'express';

export class AuthenticationUtil{

    public static sendAuthFailure(response: Response, status: number, description: string): Response {
        return response.status(status).json({
            message: 'Authentication Failed',
            description: description
        });
    }

    // TODO make this smarter.  Singleton, and refresh token whenever it's close to expiring
    public static async getSystemUserToken(): Promise<string>{
        const authResponse = await identityApi
        .post(`${Config.active.get('identityApiEndpoint')}${CONST.ep.AUTHENTICATE}`)
        .send({
            "email": "system@leblum.com",
            "password": Config.active.get('systemUserPassword')
        });

        return authResponse.body.token;
    }
}