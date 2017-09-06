import { User, IUserDoc } from '../models';
import { Router, Request, Response, RequestParamHandler, NextFunction, RequestHandler, Application } from 'express';
import mongoose = require('mongoose');
import { Schema, Model, Document } from 'mongoose';
import { BaseController } from './base/base.controller';
import { Config } from '../config/config';
import { ITokenPayload } from '../models/';
import { UserRepository, IOrganizationRepository, OrganizationRepository, RoleRepository, IRoleRepository } from "../repositories";
import { IUserRepository } from "../repositories/interfaces/user.repository.interface";
import { CONST } from "../constants";
import { IEmailVerification, EmailVerification } from "../models/email-verification";
import { AuthenticationUtil } from "./index";

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

export class AuthenticationController extends BaseController {

    private saltRounds: Number = 5;
    private tokenExpiration: string = '24h';
    public defaultPopulationArgument = null;

    protected repository: IUserRepository = new UserRepository();
    protected organizationRepository: IOrganizationRepository = new OrganizationRepository();
    protected roleRepository: IRoleRepository = new RoleRepository();

    constructor() {
        super();
    }

    public async authenticate(request: Request, response: Response, next: NextFunction): Promise<any> {
        try {
            const user = await this.repository.getUserForPasswordCheck(request.body.email);
            const passwordResult = await bcrypt.compare(request.body.password, user.password);
            if (passwordResult === false) {
                AuthenticationUtil.sendAuthFailure(response, 401, 'Password does not match');
                return;
            }

            const tokenPayload: ITokenPayload = {
                userId: user.id,
                organizationId: user.organizationId,
                // We're just going to put the name of the role on the token.  
                roles: user.roles.map(role => { return role.name }),
                expiration: this.tokenExpiration
            };

            const token = jwt.sign(tokenPayload, Config.active.get('jwtSecretToken'), {
                expiresIn: tokenPayload.expiration
            });

            response.json({
                authenticated: true,
                message: 'Successfully created jwt authentication token.',
                expiresIn: tokenPayload.expiration,
                token: token,
            });
        } catch (err) { AuthenticationUtil.sendAuthFailure(response, 401, err); }
    }

    /*
        1.  Issue JWT token with relatively short expiry, say 15min.    
        2.  Application checks token expiry date before any transaction requiring a token (token contains expiry date). If token has expired, then it first asks API to 'refresh' the token (this is done transparently to the UX).
        3.  API gets token refresh request, but first checks user database to see if a 'reauth' flag has been set against that user profile (token can contain user id). If the flag is present, then the token refresh is denied, otherwise a new token is issued.
    */
    public refreshToken(request: Request, response: Response, next: NextFunction): void {
        const token = request.body.token || request.query.token || request.headers['x-access-token'];
        // so you're going to get a request with a valid token, that hasn't expired yet
        // and you're going to return a new token with a new expiration date 
        // decode token
        if (token) {
            // verifies secret and checks exp
            jwt.verify(token, Config.active.get('jwtSecretToken'), (err, decodedToken: ITokenPayload) => {
                if (err) {
                    AuthenticationUtil.sendAuthFailure(response, 401, 'Failed to authenticate token. The timer *may* have expired on this token.');
                } else {
                    //get the user from the database, and verify that they don't need to re login
                    this.repository.single(decodedToken.userId).then((user) => {
                        if (user.isTokenExpired) {
                            AuthenticationUtil.sendAuthFailure(response, 401, 'The user must login again to refresh their credentials');
                        }
                        else {

                            const tokenPayload: ITokenPayload = {
                                organizationId: user.organizationId,
                                userId: user.id,
                                roles: user.roles.map(role => { return role.name }),
                                expiration: this.tokenExpiration
                            };

                            const newToken = jwt.sign(tokenPayload, Config.active.get('jwtSecretToken'), {
                                expiresIn: tokenPayload.expiration
                            });

                            response.json({
                                authenticated: true,
                                message: 'Successfully refreshed jwt authentication token.',
                                expiresIn: tokenPayload.expiration,
                                token: newToken,
                            });
                        }
                    }).catch((error) => { next(error) });
                }
            });
        }
        else {
            // If we don't have a token, return a failure
            AuthenticationUtil.sendAuthFailure(response, 403, 'No Authentication Token Provided');
        }
    }

    public authMiddleware(request: Request, response: Response, next: NextFunction): Response {
        try {
            const token = request.body.token || request.query.token || request.headers['x-access-token'];
            if (token) {
                // verifies secret and checks exp
                //Rewrite to use async or something 
                jwt.verify(token, Config.active.get('jwtSecretToken'), (err, decoded) => {
                    if (err) { AuthenticationUtil.sendAuthFailure(response, 401, `Failed to authenticate token. The timer *may* have expired on this token. err: ${err}`); }
                    else {
                        var token: ITokenPayload = decoded;
                        request[CONST.REQUEST_TOKEN_LOCATION] = token;
                        next();
                    }
                });
            } else {
                //No token, send auth failure
                return AuthenticationUtil.sendAuthFailure(response, 403, 'No Authentication Token Provided');
            }
        } catch (err) {
            AuthenticationUtil.sendAuthFailure(response, 401, "Authentication Failed");
        }
    }
}
