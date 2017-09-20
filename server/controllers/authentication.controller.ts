import { Router, Request, Response, RequestParamHandler, NextFunction, RequestHandler, Application } from 'express';
import mongoose = require('mongoose');
import { Schema, Model, Document } from 'mongoose';
import { BaseController } from './base/base.controller';
import { Config } from '../config/config';
import { ITokenPayload, IBaseModelDoc } from '../models/';
import { CONST } from "../constants";
import { ProductRepository, IProductRepository } from "../repositories/index";
import { IOwnership } from "../models/ownership.interface";
import { ApiErrorHandler } from "../api-error-handler";

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

export class AuthenticationController {

    private saltRounds: Number = 5;
    private tokenExpiration: string = '24h';

    public authMiddleware(request: Request, response: Response, next: NextFunction): Response {
        try {
            const token = request.body.token || request.query.token || request.headers['x-access-token'];
            if (token) {
                // verifies secret and checks exp
                //Rewrite to use async or something 
                jwt.verify(token, Config.active.get('jwtSecretToken'), (err, decoded) => {
                    if (err) { ApiErrorHandler.sendAuthFailure(response, 401, `Failed to authenticate token. The timer *may* have expired on this token. err: ${err}`); }
                    else {
                        var token: ITokenPayload = decoded;
                        request[CONST.REQUEST_TOKEN_LOCATION] = token;
                        next();
                    }
                });
            } else {
                //No token, send auth failure
                return ApiErrorHandler.sendAuthFailure(response, 403, 'No Authentication Token Provided');
            }
        } catch (err) {
            ApiErrorHandler.sendAuthFailure(response, 401, "Authentication Failed");
        }
    }
}
