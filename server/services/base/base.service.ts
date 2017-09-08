import { Database } from '../../config/database/database';
import { App, server } from '../../server-entry';
import { Config } from '../../config/config';
import { CONST } from "../../constants";
import { AuthenticationUtil } from '../../controllers/authentication.util';
import log = require('winston');

import * as moment from 'moment';
import * as superagent from "superagent";

import * as chai from 'chai';

const mongoose = require("mongoose");
const expect = chai.expect;
const should = chai.should();

export abstract class BaseService{    
    
    protected static apiName: string;
    protected static baseUrl: string;
    protected static systemAuthToken: string;
    
    public static async create(endpoint: string, body: any): Promise<superagent.Response> {
        try{
            return await superagent
            .post(`${this.baseUrl}${endpoint}`)
            .set(CONST.TOKEN_HEADER_KEY, this.systemAuthToken)
            .send(body);
        }
        catch(err){
            this.errorHandler(err)
        }
        
    }

    public static async single(endpoint: string, query: any): Promise<superagent.Response> {
        try{
            return await superagent
            .post(`${this.baseUrl}${endpoint}${CONST.ep.common.QUERY}`)
            .set(CONST.TOKEN_HEADER_KEY, this.systemAuthToken)
            .send(query);
        }
        catch(err){
            this.errorHandler(err)
        }
    }

    public static async deleteSingle(endpoint: string, queryBody: any): Promise<superagent.Response> {

        let queryResponse = await this.single(endpoint, queryBody);

        // There should be only one model returned by this query, and if we don't get just one back
        // we're not going to delete anything.
        // TODO: I need to figure out how to handle error responses here.
        if (queryResponse.status === 200 && queryResponse.body.length === 1 && queryResponse.body[0]._id) {
            try{
                return await superagent
                .delete(`${this.baseUrl}${endpoint}/${queryResponse.body[0]._id}`)
                .set(CONST.TOKEN_HEADER_KEY, this.systemAuthToken);
            }
            catch(err){
                this.errorHandler(err)
            }

        }
    }

    public static async patch(endpoint: string, id:string, partialBody: any): Promise<superagent.Response> {
        try{
            return await superagent
            .patch(`${this.baseUrl}${endpoint}/${id}`)
            .set(CONST.TOKEN_HEADER_KEY, this.systemAuthToken)
            .send(partialBody)
        }
        catch(err){
            this.errorHandler(err)
        }

    }

    public static errorHandler(err: any){
        if(err){
            log.error(`There was an error calling out to the ${this.apiName}`, err);
            throw err;
        }
    }
}