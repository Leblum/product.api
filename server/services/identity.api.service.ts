import { Config } from '../config/config';
import { CONST } from "../constants";

import * as moment from 'moment';
import * as superagent from "superagent";

import * as log from 'winston';
import { BaseService } from "./base/base.service";

export class IdentityApiService extends BaseService{

    constructor(endpoint:string){
        super(endpoint);
        super.baseUrl = Config.active.get('identityApiEndpoint');
        super.apiName = 'Identity.Api.Service';
    };

    public async authenticateSystemUser(): Promise<string>{
        const token = await this.authenticateUser("system@leblum.com", Config.active.get('systemUserPassword'));
        Config.active.set(CONST.SYSTEM_AUTH_TOKEN, token);
        return token;
    }

    // This will authenticate a user, and return their auth token from the identity api.
    // mostly used for testing purposes.  don't authenticate a user from this microservice.
    public async authenticateUser(email: string, password: string): Promise<string> {
        // We don't need to add a x-access-token here because the register endpoint is open.
        try {
            log.info('Authenticating a user:' + email);
            let response: superagent.Response = await superagent
                .post(`${this.baseUrl}${CONST.ep.AUTHENTICATE}`) 
                .send({
                    email: email,
                    password: password,
                });

            return response.body.token;
        }
        catch (err) {
            this.errorHandler(err);
        }
    }

    // This will register a user.
    public async registerUser(body: any): Promise<superagent.Response> {
        // We don't need to add a x-access-token here because the register endpoint is open.
        try {
            console.log('registering user ' + `${this.baseUrl}${CONST.ep.REGISTER}`)
            let response: superagent.Response = await superagent
                .post(`${this.baseUrl}${CONST.ep.REGISTER}`) 
                .send(body);

            return response;
        }
        catch (err) {
            super.errorHandler(err);
        }
    }

}