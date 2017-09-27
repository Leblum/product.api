import { Database } from '../config/database/database';
import { App, server } from '../server-entry';
import { Config } from '../config/config';
import { CONST } from "../constants";

import * as moment from 'moment';
import * as supertest from 'supertest';
import * as chai from 'chai';
import log = require('winston');
import { IdentityApiService } from "../services/identity.api.service";

const api = supertest.agent(App.server);
const identityApi = supertest(Config.active.get('identityApiEndpoint'));

const mongoose = require("mongoose");
const expect = chai.expect;
const should = chai.should();

export let systemAuthToken: string;
export let productAdminToken: string;
export let productEditorToken: string;

// We need to rename this so it doesn't collide with the authentication utility in the controllers folder.
export class AuthenticationTestUtility {

    // We want to make sure we're cleaning up any test accounts that we create on the identity api.
    public static async cleanupIdentityApi() {
        try {
            // First with the system credentials we're going to clean up the identity api.
            // get a token for the system admin account.
            systemAuthToken = await new IdentityApiService(CONST.ep.USERS).authenticateSystemUser();

            // This will double check that we actually got a token back.
            expect(systemAuthToken).length.to.be.greaterThan(0);

            // Now we have the system credentials.  it's time to clear out anything that we might want to.
            // first up lets delete users that we might have created.
            const deleteAdminUserResponse = await new IdentityApiService(CONST.ep.USERS).deleteSingle({
                "email": CONST.testing.PRODUCT_ADMIN_EMAIL
            });

            const deleteEditorUserResponse = await new IdentityApiService(CONST.ep.USERS).deleteSingle({
                "email": CONST.testing.PRODUCT_EDITOR_EMAIL
            });

            // Now let's delete the organization we created for testing.
            await new IdentityApiService(CONST.ep.ORGANIZATIONS).deleteSingle({
                "name": CONST.testing.ORGANIZATION_NAME
            });
        }
        catch (err) {
            this.handleTestError(err);
        }

    }

    public static async createIdentityApiTestData(): Promise<any> {
        try {
            await this.cleanupIdentityApi();
            //We're going to create 2 users for each of the different roles.  We'll still link them to the same organization
            const adminUserRes = await new IdentityApiService(CONST.ep.USERS).registerUser({
                "firstName": "Dave",
                "lastName": "Brown",
                "email": CONST.testing.PRODUCT_ADMIN_EMAIL,
                "password": "test354435"
            });
            const editorUserRes = await new IdentityApiService(CONST.ep.USERS).registerUser({
                "firstName": "Dave",
                "lastName": "Brown",
                "email": CONST.testing.PRODUCT_EDITOR_EMAIL,
                "password": "test354435"
            });

            // Create the organization we'll use for testing
            let orgResponse = await new IdentityApiService(CONST.ep.ORGANIZATIONS).createRaw({
                "name": CONST.testing.ORGANIZATION_NAME,
                "isSystem": false,
                "type": 3,
                "users": [
                    adminUserRes.body._id,
                    editorUserRes.body._id
                ]
            });

            // So we're going to issue a patch request to update the roles array on our new users
            // find me 2 different roles.  I want one role that was the 'product:owner', and one that was 'product:editor'
            let productAdminRoleResponse = await new IdentityApiService(CONST.ep.ROLES).query(
                {
                    "name": CONST.PRODUCT_ADMIN_ROLE
                });
            let productEditorRoleResponse = await new IdentityApiService(CONST.ep.ROLES).query(
                {
                    "name": CONST.PRODUCT_EDITOR_ROLE
                });

            // Patch the user with the roles we found.
            const adminResponse = await new IdentityApiService(CONST.ep.USERS).update(
                {
                    "roles": productAdminRoleResponse.body
                },adminUserRes.body._id);


            const editorResponse = await new IdentityApiService(CONST.ep.USERS).update( {
                "roles": productEditorRoleResponse.body
            }, editorUserRes.body._id);

            // Now we can use these tokens when we call back out to the product api during testing.
            productAdminToken = await new IdentityApiService(CONST.ep.USERS).authenticateUser(CONST.testing.PRODUCT_ADMIN_EMAIL,"test354435");
            productEditorToken = await new IdentityApiService(CONST.ep.USERS).authenticateUser(CONST.testing.PRODUCT_EDITOR_EMAIL,"test354435");

        } catch (err) {
            this.handleTestError(err);
        }
    }

    private static handleTestError(err: any): void {
        log.error('There was an error during the authentication utitlity setup');
        log.error(err)
        throw err;
    }
}