import { Database } from '../../config/database/database';
import { App, server } from '../../server-entry';
import { User, IUserDoc, Permission, Role, Organization, IUser, EmailVerification } from '../../models';
import { Config } from '../../config/config';
import { CONST } from "../../constants";
import { AuthenticationUtil } from "../authentication.util.spec";
import { Cleanup } from "../cleanup.util.spec";
import { suite, test } from "mocha-typescript";
import { DatabaseBootstrap } from "../../config/database/database-bootstrap";

import * as moment from 'moment';
import * as supertest from 'supertest';
import * as chai from 'chai';

const api = supertest.agent(App.server);  
const mongoose = require("mongoose");
const expect = chai.expect;
const should = chai.should();

let userAuthToken: string;
let systemAuthToken: string;
let guestOrgId: string;

@suite('Email Verification Test')
class EmailVerificationTest {

    public static async before() {
        console.log('Testing Email Verification');
        await Cleanup.clearDatabase();
        await DatabaseBootstrap.seed();

        userAuthToken = await AuthenticationUtil.generateUserAuthToken();
        systemAuthToken = await AuthenticationUtil.generateSystemAuthToken();
        guestOrgId = (await AuthenticationUtil.findGuestOrganization()).id;
    }

    @test('register then verify workflow')
    public async register() {
        let user = {
            "firstName": "Dave",
            "lastName": "Brown",
            "email": "registeredUser@leblum.com",
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

        //Now we're going to test the email verification workflow.
        // First we need to act like we've recieved an email 
        // the email will have the email verification id in it, but here we're just going to search for the email verification record that was created by userID
        let emailVerificationRecord = await EmailVerification.findOne({userId: userResponse.body._id});
        expect(emailVerificationRecord).to.not.be.null;

        // Now we craft up a request that the client would send, after clicking the link to verify their email.
        let validateRequest = {
            id: emailVerificationRecord.id
        }

        let response = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.VALIDATE_EMAIL}`).send(validateRequest);
        
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('object');

        let updatedUser = await api
            .get(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.USERS}/${userResponse.body._id}`)
            .set("x-access-token", systemAuthToken)

        expect(updatedUser.status).to.equal(200);
        expect(updatedUser.body).to.be.an('object');
        expect(updatedUser.body.isEmailVerified).to.be.true;

        return;
    }

    @test('register then verify late, after expiration should fail')
    public async registerThenFailForEmailValidation() {
        let user = {
            "firstName": "Dave",
            "lastName": "Brown",
            "email": "reou8g78g7asldfkj@leblum.com",
            "password": "test354435"
        }

        let userResponse = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.REGISTER}`)
            .send(user);
        expect(userResponse.status).to.equal(201);
        expect(userResponse.body).to.be.an('object');
        expect(userResponse.body.email).to.be.equal(user.email);
        expect(userResponse.body.password.length).to.be.equal(0);
        expect(userResponse.body.isEmailVerified).to.be.false;

        //Now we're going to test the email verification workflow.
        // First we need to act like we've recieved an email 
        // the email will have the email verification id in it, but here we're just going to search for the email verification record that was created by userID
        let emailVerificationRecord = await EmailVerification.findOne({userId: userResponse.body._id});

        // Double checking that the record was created.
        expect(emailVerificationRecord).to.not.be.null;

        // Here we're going to hit the database and update the moment to a week ago.
        let emailVerifyDoc = await EmailVerification.findById(emailVerificationRecord.id);
        emailVerifyDoc.expiresOn = moment().subtract(8,'days').format(CONST.MOMENT_DATE_FORMAT);
        await emailVerifyDoc.save();

        // Now we craft up a request that the client would send, after clicking the link to verify their email.
        let validateRequest = {
            id: emailVerificationRecord.id
        }

        let response = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.VALIDATE_EMAIL}`).send(validateRequest);

        expect(response.status).to.equal(400);
        expect(response.body).to.be.an('object');

        let updatedUser = await api
            .get(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.USERS}/${userResponse.body._id}`)
            .set("x-access-token", systemAuthToken)

        expect(updatedUser.status).to.equal(200);
        expect(updatedUser.body).to.be.an('object');
        expect(updatedUser.body.isEmailVerified).to.be.false;

        return;
    }
}
