import { Database } from '../../config/database/database';
import { App, server } from '../../server-entry';
import { User, IUserDoc, Permission, Role, Organization, IUser } from '../../models';
import { Config } from '../../config/config';
import { CONST } from "../../constants";
import { AuthenticationUtil } from "../authentication.util.spec";
import { Cleanup } from "../cleanup.util.spec";
import { suite, test } from "mocha-typescript";
import { DatabaseBootstrap } from "../../config/database/database-bootstrap";

import * as supertest from 'supertest';
import * as chai from 'chai';

const api = supertest.agent(App.server);  
const mongoose = require("mongoose");
const expect = chai.expect;
const should = chai.should();

let userAuthToken: string;
let systemAuthToken: string;
let guestOrgId: string;

@suite('User Test')
class UserTest {

    // There's a hack here.  The user test is the first one that's run,
    // so that's the test that waits for the 'dbConnected' event to be fired.  None of the other tests do this, but 
    // I couldn't seem to figure out another way around the race conditions that are created by the server starting up.
    public static before(done) {
        console.log('Testing user test');
        App.server.on('dbConnected',async ()=>{
            await Cleanup.clearDatabase();
            await DatabaseBootstrap.seed();
    
            userAuthToken = await AuthenticationUtil.generateUserAuthToken();
            systemAuthToken = await AuthenticationUtil.generateSystemAuthToken();
            guestOrgId = (await AuthenticationUtil.findGuestOrganization()).id;
            done();
        });
    }

    public static async after(){
        await Cleanup.clearDatabase();
    }

    @test('allow a user to register')
    public async register() {
        let user = {
            "firstName": "Dave",
            "lastName": "Brown",
            "email": "registeredUser@leblum.com",
            "password": "test354435",
            "isTokenExpired": false
        }

        let response = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.REGISTER}`)
            .send(user);
        expect(response.status).to.equal(201);
        expect(response.body).to.be.an('object');
        expect(response.body.email).to.be.equal(user.email);
        expect(response.body.password.length).to.be.equal(0);
        return;
    }

    @test('should list all the users')
    public async userList() {
        let response = await api
            .get(`${CONST.ep.API}${CONST.ep.V1}/${CONST.ep.USERS}`)
            .set("x-access-token", systemAuthToken);

        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
        expect(response.body.length).to.be.greaterThan(0); // we have a seed user, and a new temp user.
        return;
    }

    @test('should NOT list all the users for a regular user')
    public async failUserListForAuthentication() {
        let response = await api
            .get(`${CONST.ep.API}${CONST.ep.V1}/${CONST.ep.USERS}`)
            .set("x-access-token", systemAuthToken);

        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
        expect(response.body.length).to.be.greaterThan(0); // we have a seed user, and a new temp user.
        return;
    }

    @test('should NOT Allow delete with a regular user')
    public async noDeleteAllowed() {
        let user: IUser = {
            email: "6788765768@test.com",
            password: "test",
            isTokenExpired: false,
            firstName: "Dave",
            lastName: "Brown",
            organizationId: guestOrgId,
            isEmailVerified: false,
        };
        //By calling this I'll generate an id
        let userDoc = new User(user)

        let createResponse = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}/${CONST.ep.USERS}`)
            .set("x-access-token", systemAuthToken)
            .send(user);

        let response = await api
            .delete(`${CONST.ep.API}${CONST.ep.V1}/${CONST.ep.USERS}/${userDoc.id}`)
            .set("x-access-token", userAuthToken);

        expect(response.status).to.equal(403);
        expect(response.body).to.be.an('object');
        return;
    }

    @test('should create a user')
    public async create() {
        let user: IUser = {
            firstName: "Dave",
            lastName: "Brown",
            email: "test2@test.com",
            password: "test1234",
            isTokenExpired: false,
            organizationId: guestOrgId,
            isEmailVerified: false,
        };

        let response = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}/${CONST.ep.USERS}`)
            .set("x-access-token", systemAuthToken)
            .send(user);

        expect(response.status).to.equal(201);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('model');
        expect(response.body.model).to.have.property('email');
        expect(response.body.model.email).to.equal(user.email);
        expect(response.body.model.password).should.not.equal(user.password);
        return;
    }


    @test('should create the user in the db and make sure get by id works')
    public async getByIdWorking() {
        let user: IUser = {
            email: "test2345@test.com",
            password: "test",
            isTokenExpired: false,
            firstName: "Dave",
            lastName: "Brown",
            organizationId: guestOrgId,
            isEmailVerified: false,
        };

        let userDoc = await new User(user).save();

        let response = await api
            .get(`${CONST.ep.API}${CONST.ep.V1}/${CONST.ep.USERS}/${userDoc.id}`)
            .set("x-access-token", systemAuthToken)

        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('email');
        expect(response.body.email).to.equal(user.email);
        return;
    }

    @test('it should update a user')
    public async updateAUser() {
        let user: IUser = {
            email: "qwerqwer@test.com",
            password: "test",
            isTokenExpired: false,
            firstName: "Dave",
            lastName: "Brown",
            organizationId: guestOrgId,
            isEmailVerified: false,
        };

        let userDoc = await new User(user).save();

        let userUpdate = {
            _id: `${userDoc.id}`,
            firstName: "Don",
            lastName: "Jaun",
        };

        let response = await api
            .put(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.USERS}/${userDoc.id}`)
            .set("x-access-token", systemAuthToken)
            .send(userUpdate);

        expect(response.status).to.equal(202);
        expect(response.body).to.have.property('model');
        expect(response.body.model).to.have.property('firstName');
        expect(response.body.model.firstName).to.equal(userUpdate.firstName);
        return;
    }

    @test('it should delete a user')
    public async deleteAUser() {
        let user: IUser = {
            email: "24352345@test.com",
            password: "test",
            isTokenExpired: false,
            firstName: "Dave",
            lastName: "Brown",
            organizationId: guestOrgId,
            isEmailVerified: false,
        };

        let createResponse = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.USERS}`)
            .set("x-access-token", systemAuthToken)
            .send(user);

        let response = await api
            .delete(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.USERS}/${createResponse.body.model._id}`)
            .set("x-access-token", systemAuthToken);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('ItemRemoved');
        expect(response.body).to.have.property('ItemRemovedId');
        expect(response.body.ItemRemovedId).to.be.equal(createResponse.body.model._id);
        expect(response.body.ItemRemoved.email).to.be.equal(user.email);
        return;
    }

    @test('should return a 404 on delete when the ID isnt there')
    public async onDeleteWithoutUserID404() {
        let response = await api
            .delete(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.USERS}/58f8c8caedf7292be80a90e4`)
            .set("x-access-token", systemAuthToken);

        expect(response.status).to.equal(404);
        return;
    }

    @test('should return a 404 on update when the ID isnt there')
    public async onUpdateWithoutUserID404() {
        let response = await api
            .put(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.USERS}/58f8c8caedf7292be80a90e4`)
            .set("x-access-token", systemAuthToken);

        expect(response.status).to.equal(404);
        return;
    }
}
