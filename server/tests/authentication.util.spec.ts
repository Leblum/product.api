//During the test the env variable is set to test
import { Database } from '../config/database/database';
import { App, server } from '../server-entry';
import { Config } from '../config/config';

let mongoose = require("mongoose");
import * as chai from 'chai';
import { CONST } from "../constants";
let expect = chai.expect;
let should = chai.should();
chai.use(require('chai-http'));
var bcrypt = require('bcrypt');

export class AuthenticationUtil {
    
}