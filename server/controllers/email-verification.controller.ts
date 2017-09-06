import { EmailVerification, IEmailVerification, IEmailVerificationDoc } from '../models';
import { Router, Request, Response, RequestParamHandler, NextFunction, RequestHandler, Application } from 'express';
import mongoose = require('mongoose');
import { Schema, Model, Document } from 'mongoose';
import { BaseController } from './base/base.controller';
import { CONST } from '../constants';
import { EmailVerificationRepository, IEmailVerificationRepository, UserRepository } from '../repositories';
import * as moment from 'moment';
import { ApiErrorHandler } from "../api-error-handler";

export class EmailVerificationController extends BaseController {
    public defaultPopulationArgument =
    {
        path: 'user'
    }

    protected repository: IEmailVerificationRepository = new EmailVerificationRepository();

    constructor() {
        super();
    }

    public async validateEmail(request: Request, response: Response, next: NextFunction): Promise<any> {
        try {
            if (!request.body || !request.body.id) {
                ApiErrorHandler.sendError("Item Not Found", 404, response)
                return;
            }
            
            if (!mongoose.Types.ObjectId.isValid(request.body.id)) {
                ApiErrorHandler.sendError("The id supplied was not a valid bson token.", 400, response)
                return;
            }

            const emailVerifcationRecord = await this.repository.single(request.body.id);
            if (!emailVerifcationRecord) {
                ApiErrorHandler.sendError("Item Not Found", 404, response)
                return;
            }

            // Now we have the email verification record
            // We're going to check the expiration against the time it was created.
            if (!moment().isBefore(moment(emailVerifcationRecord.expiresOn, CONST.MOMENT_DATE_FORMAT))) {
                // Here that record has already expired
                ApiErrorHandler.sendError("That email verification record has expired, please request a new one", 400, response, CONST.errorCodes.EMAIL_VERIFICATION_EXPIRED)
                return;
            }

            // Now we know the timer checks out. let's update the user record, and get them on their way.
            let user = await new UserRepository().single(emailVerifcationRecord.userId);
            user.isEmailVerified = true;
            await user.save();

            // Commented for testing    
            await emailVerifcationRecord.remove();

            response.status(200).json({
                message: "Email Verified Completed",
            });
        }
        catch (err) {
            next(err)
        }
    }
}
