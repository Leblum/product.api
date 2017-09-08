import { IProduct, Product } from "../models";
import { Config } from "./config";
import { CONST } from "../constants";
import { OrganizationType } from "../enumerations";

import * as identityApi from "superagent";

const util = require('util');
var bcrypt = require('bcrypt');
import log = require('winston');
import { AuthenticationUtil } from "../controllers/authentication.util";

// This is where we're going to bootstrap other services that we need to interact with.
// In this case we're talking to the identity service, and we need to make sure that it has the roles that we need.
export class SupportingServicesBootstrap {

    public static async seed() {
        await this.seedIdentityApi();
    }

    private static async seedIdentityApi() {
        // We need to get a system user token so authenticate with the system user creds first
        try {
            const systemToken = await AuthenticationUtil.getSystemUserToken();

            // Here we're going to seed the identity api with the roles that we require.
            this.seedRole('product:admin', 'Full control over products.', systemToken);
            this.seedRole('product:editor', 'Creates products from templates, can edit products, no editing templates', systemToken);
        }
        catch (err) {
            this.errorHandler(err);
        }
    }

    private static async seedRole(roleName: string, description: string, systemToken: string) {
        try{
            // first make sure they don't exist.  So we're going to query the roles endpoint and see if they're there
            const productUserRoleResponse = await identityApi
            .post(`${Config.active.get('identityApiEndpoint')}${CONST.ep.ROLES}${CONST.ep.common.QUERY}`)
            .set('x-access-token', systemToken)
            .send({
                "name": roleName,
            });

            if (productUserRoleResponse.body.length === 0) {
            // In the future we really need to figure out what permissions we give to each one of these.
            await identityApi
                .post(`${Config.active.get('identityApiEndpoint')}${CONST.ep.ROLES}`)
                .set('x-access-token', systemToken)
                .send({
                    "name": roleName,
                    "description": description,
                    "permissions": []
                });
            }
        }
        catch (err){
            this.errorHandler(err);
        }
        
    }

    private static errorHandler(err:any){
        log.error('There was a problem seeding data to the authentication API', {
            identityApiResponse: err && err.response && err.response.body ? err.response.body : err
        });
        throw ({
            message: 'There was a problem seeding data to the authentication API',
            identityApiResponse: err && err.response && err.response.body ? err.response.body : err
        })
    }
}