import { Database } from '../../config/database/database';
import { App, server } from '../../server-entry';
import { Product, IProduct, ITokenPayload, IOrder, Order, ISupplier, IOrderDoc, ISupplierDoc, IProductDoc } from '../../models';
import { Config } from '../../config/config';
import { CONST } from "../../constants";
import { AuthUtil } from "../authentication.util.spec";
import { Cleanup } from "../cleanup.util.spec";
import { suite, test } from "mocha-typescript";
import { DatabaseBootstrap } from "../../config/database/database-bootstrap";
import * as enums from '../../enumerations';

import * as supertest from 'supertest';
import * as chai from 'chai';
import { BijectionEncoder } from '../../utils/bijection-encoder';
import * as log from 'winston';

const api = supertest.agent(App.server);
const mongoose = require("mongoose");
const expect = chai.expect;
const should = chai.should();

@suite('Order Model -> ')
class OrderTest {

    // First we need to get some users to work with from the identity service
    public static before(done) {
        console.log('Testing orders');
        // This code should only be called if this test is run as a single test.  When run in the suite along with
        // bootstrap.util.spec this code is run by the bootstrap spec.
        // App.server.on('dbConnected', async () => {
        //     await Cleanup.clearDatabase();
        //     await DatabaseBootstrap.seed();

        //     // This will create, 2 users, an organization, and add the users to the correct roles.
        //     await AuthUtil.createIdentityApiTestData();
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

    @test('Testing that our pre save methods work as we think they should for orders')
    public async savingIdandOrderNumberAndOrderCode() {
        let productDoc: IProductDoc = await this.createProduct();
        let supplierDoc: ISupplierDoc = await this.createSupplier();

        let order: IOrder = {
            supplier: supplierDoc,
            status: enums.OrderStatus.entered,
            items: [{
                product: productDoc,
                price: 10.00,
                quantity: 3
            },
            {
                product: productDoc,
                price: 30.00,
                quantity: 25,
            }]
        }

        let response = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.ORDERS}`)
            .set(CONST.TOKEN_HEADER_KEY, AuthUtil.systemAuthToken)
            .send(order);

        expect(response.status).to.equal(201);
        expect(response.body).to.be.an('object');
        expect(response.body.code).to.equal(BijectionEncoder.encode(response.body.orderNumber));

        let response2 = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.ORDERS}`)
            .set(CONST.TOKEN_HEADER_KEY, AuthUtil.systemAuthToken)
            .send(order);

        expect(response2.status).to.equal(201);
        expect(response2.body).to.be.an('object');
        expect(response2.body.orderNumber).to.be.equal(response.body.orderNumber + 1); // making sure our order number is increasing by 1;

        return;
    }

    @test('make sure we get back a supplier, and a product on the object for get single')
    public async getByIdPopulatesSupplierAndProduct() {
        let productDoc = await this.createProduct();
        let supplierDoc = await this.createSupplier();

        let order: IOrderDoc = await this.createOrder(supplierDoc, productDoc);

        // now we try and do a get single, and see if we get back a populated order

        let response = await api
            .get(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.ORDERS}/${order._id}`)
            .set("x-access-token", AuthUtil.systemAuthToken);
        //console.dir(response.body.items);
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('code');
        expect(response.body.items).to.be.an('array');

        // Here we're checking to make sure that data population is working, because 
        // there's some pretty weird path stuff going on in the mongoose population stuff.
        console.dir(response.body.items[0]);
        expect(response.body.items[0].product.displayName).to.be.equal(productDoc.displayName);
        expect(response.body.supplier.name).to.be.equal(supplierDoc.name);
        return;
    }

    /// **************** Helper Methods *********************** ///
    private async createSupplier(): Promise<ISupplierDoc> {
        let supplier: ISupplier = {
            isActive: true,
            isApproved: false,
            name: `JRose Magic Flowers 2134123${Math.floor(Math.random() * 1321)}`,
            slug: `${Math.floor(Math.random() * 1321)}dbrownasdf3254adf`,
        }

        let response = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.SUPPLIERS}`)
            .set(CONST.TOKEN_HEADER_KEY, AuthUtil.systemAuthToken)
            .send(supplier);

        expect(response.status).to.equal(201);
        expect(response.body).to.be.an('object');
        expect(response.body.name).to.be.equal(supplier.name);
        expect(response.body.isActive).to.be.equal(true);
        expect(response.body.isApproved).to.be.equal(false);
        return response.body as ISupplierDoc;
    }

    private async createOrder(supplier: ISupplierDoc, product: IProductDoc): Promise<IOrderDoc> {
        let order: IOrder = {
            supplier: supplier,
            status: enums.OrderStatus.entered,
            items: [{
                product: product,
                price: 10.00,
                quantity: 3
            },
            {
                product: product,
                price: 30.00,
                quantity: 25,
            }]
        }

        let response = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.ORDERS}`)
            .set(CONST.TOKEN_HEADER_KEY, AuthUtil.systemAuthToken)
            .send(order);

        expect(response.status).to.equal(201);
        expect(response.body).to.be.an('object');
        expect(response.body.code).to.equal(BijectionEncoder.encode(response.body.orderNumber));
        return response.body as IOrderDoc;
    }

    private async createProduct(): Promise<IProductDoc> {
        let product: IProduct = {
            displayName: "Midnight Snap Dragon",
            isTemplate: true,
        }

        let productCreateResponse = await api
            .post(`${CONST.ep.API}${CONST.ep.V1}${CONST.ep.PRODUCTS}`)
            .set(CONST.TOKEN_HEADER_KEY, AuthUtil.productAdminToken)
            .send(product);

        expect(productCreateResponse.status).to.equal(201);
        expect(productCreateResponse.body).to.be.an('object');
        expect(productCreateResponse.body.displayName).to.be.equal(product.displayName);
        return productCreateResponse.body as IProductDoc
    }
}
