import { Database } from '../../config/database/database';
import { App, server } from '../../server-entry';
import { User, IUserDoc, Permission, Role, Organization, IUser, EmailVerification, PasswordResetToken } from '../../models';
import { Config } from '../../config/config';
import { CONST } from "../../constants";
import { AuthenticationUtil } from "../authentication.util.spec";
import { Cleanup } from "../cleanup.util.spec";
import { suite, test } from "mocha-typescript";
import { DatabaseBootstrap } from "../../config/database/database-bootstrap";

import * as moment from 'moment';
import * as supertest from 'supertest';
import * as chai from 'chai';
import { UserRepository } from "../../repositories/index";

const api = supertest.agent(App.server);
const mongoose = require("mongoose");
const expect = chai.expect;
const should = chai.should();
const bcrypt = require('bcrypt');

let userAuthToken: string;
let systemAuthToken: string;
let guestOrgId: string;

@suite('Reset Password Workflow')
class ResetPasswordWorkflowTest {

    public static async before() {
        console.log('Testing Password Workflow');
        await Cleanup.clearDatabase();
        await DatabaseBootstrap.seed();

        userAuthToken = await AuthenticationUtil.generateUserAuthToken();
        systemAuthToken = await AuthenticationUtil.generateSystemAuthToken();
        guestOrgId = (await AuthenticationUtil.findGuestOrganization()).id;
    }

    public static async after(){
        await Cleanup.clearDatabase();
    }

    @test('register -> request password reset -> reset password')
    public async resetPasswordFlow() {
        let user = {
            "firstName": "Dave",
            "lastName": "Brown",
            "email": "registeredUserasdf@leblum.com",
            "password": "test354435",
            "isTokenExpired": false
        }

        let userResponse = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.REGISTER}`)
            .send(user);
        expect(userResponse.status).to.equal(201);
        expect(userResponse.body).to.be.an('object');
        expect(userResponse.body.email).to.be.equal(user.email);
        expect(userResponse.body.password.length).to.be.equal(0);
        expect(userResponse.body.isEmailVerified).to.be.false;

        //I also want to find this new user in the database. so I can compare the hashes. 

        // First we request a password reset.  This would be done by the user hitting the forgot password button
        // { email: email }
        let passwordResetRequest = {
            email: 'registeredUserasdf@leblum.com'
        }

        let passwordResetTokenResponse = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.PASSWORD_RESET_REQUEST}`)
            .send(passwordResetRequest);
        expect(passwordResetTokenResponse.status).to.equal(200);
        expect(passwordResetTokenResponse.body).to.be.an('object');
        expect(passwordResetTokenResponse.body.message.length).to.be.greaterThan(0);

        // Now we should have a password reset request in the database for that user.
        // let's go find it, and make sure it created one.
        let passwordResetTokenDoc = await PasswordResetToken.findOne({userId: userResponse.body._id});
        expect(passwordResetTokenDoc).to.not.be.null;


        // Now we craft up a request that the client would send after setting a new password.
        let newPasswordRequest = { 
            passwordResetTokenId: passwordResetTokenDoc.id, 
            password: 'newPassword' 
        }

        // We post this new password to the api.
        let response = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.PASSWORD_RESET}`).send(newPasswordRequest);
        
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('object');

        // Now let's grab the user from the database, and see if the new password passes for bcrypt compare. 
        let updatedUserDoc = await new UserRepository().getUserForPasswordCheck(userResponse.body.email);
        const passwordResult = await bcrypt.compare(newPasswordRequest.password, updatedUserDoc.password);
        
        // We should see that the password has been properly updated, and now passes our hash comparison.
        expect(passwordResult).to.be.true;

        // Now let's double check by authenticating this user, with his new password.
        let authResponse = await api.post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.AUTHENTICATION}`)
        .send({
            "email": "registeredUserasdf@leblum.com",
            "password": "newPassword"
        });

        authResponse.should.have.status(200);
        authResponse.body.should.be.a('object');
        authResponse.body.should.have.property('token');

        return;
    }

    @test('register -> request password reset -> reset password with expired token')
    public async resetPasswordWithExpiredToken() {
        let user = {
            "firstName": "Dave",
            "lastName": "Brown",
            "email": "registeredUser2wer@leblum.com",
            "password": "test354435",
            "isTokenExpired": false
        }

        let userResponse = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.REGISTER}`)
            .send(user);
        expect(userResponse.status).to.equal(201);
        expect(userResponse.body).to.be.an('object');
        expect(userResponse.body.email).to.be.equal(user.email);
        expect(userResponse.body.password.length).to.be.equal(0);
        expect(userResponse.body.isEmailVerified).to.be.false;

        //I also want to find this new user in the database. so I can compare the hashes. 

        // First we request a password reset.  This would be done by the user hitting the forgot password button
        // { email: email }
        let passwordResetRequest = {
            email: 'registeredUser2wer@leblum.com'
        }

        let passwordResetTokenResponse = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.PASSWORD_RESET_REQUEST}`)
            .send(passwordResetRequest);
        expect(passwordResetTokenResponse.status).to.equal(200);
        expect(passwordResetTokenResponse.body).to.be.an('object');
        expect(passwordResetTokenResponse.body.message.length).to.be.greaterThan(0);

        // Now we should have a password reset request in the database for that user.
        // let's go find it, and make sure it created one.
        let passwordResetTokenDoc = await PasswordResetToken.findOne({userId: userResponse.body._id});
        expect(passwordResetTokenDoc).to.not.be.null;

        //now we change the password reset expire time to be in the past.
        passwordResetTokenDoc.expiresOn =  moment().subtract(moment.duration(25, 'hours')).format(CONST.MOMENT_DATE_FORMAT);
        passwordResetTokenDoc.save();

        // Now we craft up a request that the client would send after setting a new password.
        let newPasswordRequest = { 
            passwordResetTokenId: passwordResetTokenDoc.id, 
            password: 'newPassword' 
        }

        // We post this new password to the api.
        let response = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.PASSWORD_RESET}`).send(newPasswordRequest);
        
        expect(response.status).to.equal(400);
        expect(response.body).to.be.an('object');

        return;
    }
    
    @test('request a password reset with a user that doesnt exist should still return a 200')
    public async requestResetWithAUserThatDoesntExist() {
        let passwordResetRequest = {
            email: 'asodfu8ew7r4oasiduf@leblum.com'
        }

        let passwordResetTokenResponse = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.PASSWORD_RESET_REQUEST}`)
            .send(passwordResetRequest);
        expect(passwordResetTokenResponse.status).to.equal(200);
        expect(passwordResetTokenResponse.body).to.be.an('object');
        expect(passwordResetTokenResponse.body.message.length).to.be.greaterThan(0);

        return;
    }
}
