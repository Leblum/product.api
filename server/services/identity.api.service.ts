import { BaseService } from "./base/base.service";
import { Config } from '../config/config';
import { CONST } from "../constants";
import { AuthenticationUtil } from '../controllers/authentication.util';

import * as moment from 'moment';
import * as superagent from "superagent";

import * as chai from 'chai';

const expect = chai.expect;
const should = chai.should();

export class IdentityApiService extends BaseService {

    private static _constructor = (async () => {
        BaseService.baseUrl = Config.active.get('identityApiEndpoint');
        BaseService.systemAuthToken = await AuthenticationUtil.getSystemUserToken();
        BaseService.apiName = 'Identity.Api.Service';
    })();

    public static async registerUser(email: string): Promise<superagent.Response> {
        // first we're going to register a user that we're going to use for testing.
        let user = {
            "firstName": "Dave",
            "lastName": "Brown",
            "email": email,
            "password": "test354435"
        }

        // We don't need to add a x-access-token here because the register endpoint is open.
        try {
            let response: superagent.Response = await superagent
                .post(`${super.baseUrl}${CONST.ep.REGISTER}`)
                .send(user);

            // here this is the first time we've created this user.
            // make sure nothing is leaking out.
            expect(response.status).to.equal(201);
            expect(response.body).to.be.an('object');
            expect(response.body.email).to.be.equal(user.email);
            expect(response.body.password.length).to.be.equal(0);
            return response;
        }
        catch (err) {
            BaseService.errorHandler(err)
        }
    }
}