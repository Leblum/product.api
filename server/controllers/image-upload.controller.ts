import { Router, Request, Response, RequestParamHandler, NextFunction, RequestHandler, Application } from 'express';
import mongoose = require('mongoose');
import { Schema, Model, Document } from 'mongoose';
import { Config } from '../config/config';
import { ITokenPayload, IBaseModelDoc, IProduct } from '../models/';
import { CONST } from "../constants";
import { ApiErrorHandler } from "../api-error-handler";
import * as rimraf from 'rimraf';
import * as path from 'path';
import * as multer from 'multer';
import * as sharp from 'sharp';
import log = require('winston');
import * as enums from '../enumerations';
import * as AWS from 'aws-sdk';
import { ProductRepository } from '../repositories/index';
import * as fs from 'async-file';

export interface MulterFile {
    path: string // Available using `DiskStorage`.
    mimetype: string
    originalname: string,
    encoding: string,
    destination: string,
    filename: string,
    size: number
}

export class ImageUploadController {


    public async imageUploadMiddleware(request: Request, response: Response, next: NextFunction) {
        try {
            // Because this is created as a middleware this doesn't point to the class.
            const controller = new ImageUploadController();
            await controller.handler(request, response, next);
            next();
        } catch (err) {
            ApiErrorHandler.sendError(`Image Uploading / Resizing failed. ${err}`, 500, response, null, err);
        }
    }

    public async handler(request: Request, response: Response, next: NextFunction) {
        // Here we're going to create a few different versions of the file so we can use those later.
        const rawImageFile = request.files[0] as MulterFile;

        // request.body.relatedId hold the id of the current product.
        console.log(request.body);

        // Create image variations
        let raw = await this.formatImage(enums.ImageType[enums.ImageType.raw], rawImageFile, response);
        let thumb = await this.formatImage(enums.ImageType[enums.ImageType.thumbnail], rawImageFile, response, 150, 150);
        let icon = await this.formatImage(enums.ImageType[enums.ImageType.icon], rawImageFile, response, 50, 50, 50);
        let small = await this.formatImage(enums.ImageType[enums.ImageType.small], rawImageFile, response, 300);
        let medium = await this.formatImage(enums.ImageType[enums.ImageType.medium], rawImageFile, response, 500);
        let large = await this.formatImage(enums.ImageType[enums.ImageType.large], rawImageFile, response, 1024);

        //Now we go get the product

        const product = await new ProductRepository().single(request.body.relatedId);

        // figure out what the maximum product image order number is, and add one to it. 
        let nextOrderNum = this.getNextOrderNumber(product);
        // Add the product images.
        this.addImage(product, rawImageFile, raw, enums.ImageType.raw, nextOrderNum);
        this.addImage(product, rawImageFile, thumb, enums.ImageType.thumbnail, nextOrderNum);
        this.addImage(product, rawImageFile, icon, enums.ImageType.icon, nextOrderNum);
        this.addImage(product, rawImageFile, small, enums.ImageType.small, nextOrderNum);
        this.addImage(product, rawImageFile, medium, enums.ImageType.medium, nextOrderNum);
        this.addImage(product, rawImageFile, large, enums.ImageType.large, nextOrderNum);

        const updatedProduct = await new ProductRepository().save(product);

        response.status(200).json(updatedProduct);
    }

    public getNextOrderNumber(product: IProduct): number {
        if (product && product.images && product.images.length > 0) {
            let max = 0;
            product.images.forEach(image => {
                max = Math.max(max, image.order);
            });
            return ++max;
        }
        return 0;
    }

    public addImage(product: IProduct, file: MulterFile, sharpInfo: sharp.OutputInfo, type: enums.ImageType, order: number, ): IProduct {
        product.images.push({
            isActive: true,
            type: type,
            height: sharpInfo.height,
            width: sharpInfo.width,
            //https://s3.us-east-2.amazonaws.com/dev-product-api-images/medium-216316f5ff080e8-7315d8ebca647bfc09bdfd3907333d24-1506553172531.jpeg
            url: `https://s3.us-east-2.amazonaws.com/${Config.active.get('ProductImageBucketName')}/${enums.ImageType[type]}-${file.filename}`,
            order: order
        });
        return product;
    }

    public async formatImage(imagePrefix: string, rawImageFile: MulterFile, response: Response, width: number = null, height: number = null, quality: number = 80): Promise<sharp.OutputInfo | any> {
        const outputInfo: sharp.OutputInfo = await sharp(path.resolve(__dirname, '../../', `${CONST.IMAGE_UPLOAD_PATH}${rawImageFile.filename}`))
            .resize(width, height)
            .crop(sharp.gravity.center)
            .toFormat(sharp.format.png, {
                quality: quality,
            })
            .toFile(`${CONST.IMAGE_UPLOAD_PATH}${imagePrefix}-${rawImageFile.filename}`);

            let data = null;
            try{
                data = await fs.readFile(path.resolve(__dirname, '../../', `${CONST.IMAGE_UPLOAD_PATH}${imagePrefix}-${rawImageFile.filename}`));
            }catch(err){
                ApiErrorHandler.sendError(`Problem reading the contents of resized file back out. ${err}`, 500, response, null, err);
                return;
            }

            //while we still have easy access to the file we're going to send it up to s3.

            AWS.config.update({
                accessKeyId: Config.active.get('AWSAccessKey'),
                secretAccessKey: Config.active.get('AWSSecret'),
                region: 'us-east-2',
            });

            const s3 = new AWS.S3({
                apiVersion: '2006-03-01',
                params: { 
                    Bucket: Config.active.get('ProductImageBucketName'),
                    ACL: 'public-read',
                    Metadata:{
                        ContentType: rawImageFile.mimetype
                    }
                }
            });
            
            var putObjectPromise = s3.putObject({
                Body: data,
                Bucket: Config.active.get('ProductImageBucketName'),
                Key: `${imagePrefix}-${rawImageFile.filename}`,
                Metadata:{
                    ContentType: rawImageFile.mimetype
                },
                ContentType: rawImageFile.mimetype
            }).promise();

            return putObjectPromise.then(function(data) {
                console.log(data);
                return outputInfo;
            }).catch((err)=> {
                ApiErrorHandler.sendError(`Failure during s3 upload. ${err}`, 500, response, null, err);
                return {};
            });
    }
}
