import { Database } from '../../config/database/database';
import { App, server } from '../../server-entry';
import { Supplier, ISupplier, ITokenPayload } from '../../models';
import { Config } from '../../config/config';
import { CONST } from "../../constants";
import { AuthenticationTestUtility, systemAuthToken, productAdminToken, productEditorToken, supplierAdminToken } from "../authentication.util.spec";
import { Cleanup } from "../cleanup.util.spec";
import { suite, test } from "mocha-typescript";
import { DatabaseBootstrap } from "../../config/database/database-bootstrap";

import * as supertest from 'supertest';
import * as chai from 'chai';

const api = supertest.agent(App.server);
const mongoose = require("mongoose");
const expect = chai.expect;
const should = chai.should();

@suite('Supplier Model -> ')
class SupplierTest {

    // First we need to get some users to work with from the identity service
    public static before(done) {
        console.log('Testing suppliers');
        // This code should only be called if this test is run as a single test.  When run in the suite along with
        // bootstrap.util.spec this code is run by the bootstrap spec.
        // App.server.on('dbConnected', async () => {
        //     await Cleanup.clearDatabase();
        //     await DatabaseBootstrap.seed();

        //     // This will create, 2 users, an organization, and add the users to the correct roles.
        //     await AuthenticationTestUtility.createIdentityApiTestData();
        //     done();
        // });
        //This done should be commented if you're going to run this as suite.only()
        done();
    }

    public static async after() {
        await Cleanup.clearDatabase();
    }

    @test('Just setting up a test for testing initialization')
    public async initialize() {
        expect(1).to.be.equal(1);
        return;
    }

    @test('Create a supplier')
    public async CreateASupplier() {
        let supplier: ISupplier = {
            isActive: true,
            isApproved: false,
            name: 'JRose Magic Flowers',
        }

        let response = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.SUPPLIERS}`)
            .set(CONST.TOKEN_HEADER_KEY, systemAuthToken)
            .send(supplier);

        expect(response.status).to.equal(201);
        expect(response.body).to.be.an('object');
        expect(response.body.name).to.be.equal(supplier.name);
        expect(response.body.isActive).to.be.equal(true);
        expect(response.body.isApproved).to.be.equal(false);
        return;
    }

    @test('Supplier Admins should be able to create a supplier')
    public async CreateASupplierByAdmin() {
        let supplier: ISupplier = {
            isActive: true,
            isApproved: false,
            name: 'JRose Magic Flowers',
        }

        let response = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.SUPPLIERS}`)
            .set(CONST.TOKEN_HEADER_KEY, supplierAdminToken)
            .send(supplier);

        expect(response.status).to.equal(201);
        expect(response.body).to.be.an('object');
        expect(response.body.name).to.be.equal(supplier.name);
        expect(response.body.isActive).to.be.equal(true);
        expect(response.body.isApproved).to.be.equal(false);
        return;
    }
}
