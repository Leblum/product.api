import { Router, Request, Response, RequestParamHandler, NextFunction, RequestHandler, Application } from 'express';
import mongoose = require('mongoose');
import { Schema, Model, Document } from 'mongoose';
import { BaseController } from './base/base.controller';
import { CONST } from '../constants';
import { PasswordResetTokenRepository, IPasswordResetTokenRepository, UserRepository, IUserRepository } from '../repositories';
import * as moment from 'moment';
import { ApiErrorHandler } from "../api-error-handler";
import { IPasswordResetToken, PasswordResetToken } from "../models/index";
import { PasswordResetNotification } from "../notifications/index";
const bcrypt = require('bcrypt');

export class PasswordResetTokenController extends BaseController {
    public defaultPopulationArgument =
    {
        path: 'user'
    }

    protected repository: IPasswordResetTokenRepository = new PasswordResetTokenRepository();
    protected userRepo: IUserRepository = new UserRepository();

    constructor() {
        super();
    }

    public async requestPasswordReset(request: Request, response: Response, next: NextFunction): Promise<any> {
        try {
            if (!request.body || !request.body.email) {
                ApiErrorHandler.sendError("Item Not Found", 404, response)
                return;
            }

            // Now we're going to return a 200 no matter whether the user was found or not.
            // That way people can't just spam the password reset functionality.

            // First we find a user based on that email.
            const user = await this.userRepo.findUserByEmail(request.body.email);
            if (user) {
                // Now we insert a password reset token for that user.
                const passwordResetToken: IPasswordResetToken = {
                    userId: user.id,
                    expiresOn: moment().add(moment.duration(24, 'hours')).format(CONST.MOMENT_DATE_FORMAT),
                }

                let passwordResetTokenDoc = await new PasswordResetToken(passwordResetToken).save();

                // Now we send that user an email with a link to reset their password.
                // Cleanup if there was a problem sending the password reset email. 
                try {
                    // Now we shoot off a notification to mandrill
                    await PasswordResetNotification.sendPasswordResetEmail(user.email, passwordResetTokenDoc.id, request);
                }
                catch (err) {
                    await passwordResetTokenDoc.remove();
                    throw err;
                }
            }

            response.status(200).json({
                message: "If that user existed a password link has been sent to their email.",
            });
        }
        catch (err) {
            next(err)
        }
    }

    public async resetPassword(request: Request, response: Response, next: NextFunction): Promise<any> {
        try {
            // This is how the request should be shaped.
            // { passwordResetTokenId: id, password: password }
            // Keep in mind that this token will only reset the password for one user, the userId on the token.
            if (!request.body || !request.body.passwordResetTokenId || !request.body.password) {
                ApiErrorHandler.sendError("Password Token Not Supplied, or password not supplied", 400, response)
                return;
            }

            if( !mongoose.Types.ObjectId.isValid(request.body.passwordResetTokenId) ){
                ApiErrorHandler.sendError("The password reset token supplied was not a valid bson token.", 400, response)
                return;
              }

            const passwordResetToken = await this.repository.single(request.body.passwordResetTokenId);
            if (!passwordResetToken) {
                ApiErrorHandler.sendError("Item Not Found", 404, response)
                return;
            }

            // Check the expiration for the token.
            if (!moment().isBefore(moment(passwordResetToken.expiresOn, CONST.MOMENT_DATE_FORMAT))) {
                // Here that record has already expired
                ApiErrorHandler.sendError("That password reset token has expired, please request a new one", 400, response, CONST.errorCodes.PASSWORD_RESET_TOKEN_EXPIRED);
                return;
            }

            // Now we know the timer checks out. let's update the user record, and get them on their way.
            let user = await new UserRepository().single(passwordResetToken.userId);
            user.password = await bcrypt.hash(request.body.password, CONST.SALT_ROUNDS);
            user.isTokenExpired = true;
            await user.save();

            await passwordResetToken.remove();

            response.status(200).json({
                message: "Password has been reset",
            });
        }
        catch (err) {
            next(err)
        }
    }
}
