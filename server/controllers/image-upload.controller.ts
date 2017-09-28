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
        // Grab the multer file off the request.  
        const rawImageFile = request.files[0] as MulterFile;
        if (rawImageFile) {
            try {
                //Now we go get the product
                const product = await new ProductRepository().single(request.body.relatedId);

                // Create image variations
                let raw = await this.formatImage(enums.ImageType.raw, rawImageFile, response);
                let thumb = await this.formatImage(enums.ImageType.thumbnail, rawImageFile, response, 150, 150);
                let icon = await this.formatImage(enums.ImageType.icon, rawImageFile, response, 50, 50, 50);
                let small = await this.formatImage(enums.ImageType.small, rawImageFile, response, 300);
                let medium = await this.formatImage(enums.ImageType.medium, rawImageFile, response, 500);
                let large = await this.formatImage(enums.ImageType.large, rawImageFile, response, 1024);

                // figure out what the maximum product image order number is, and add one to it. 
                let nextOrderNum = this.getNextOrderNumber(product);

                // Add the product images.
                this.updateProductImagesArray(product, rawImageFile, raw, enums.ImageType.raw, nextOrderNum);
                this.updateProductImagesArray(product, rawImageFile, thumb, enums.ImageType.thumbnail, nextOrderNum);
                this.updateProductImagesArray(product, rawImageFile, icon, enums.ImageType.icon, nextOrderNum);
                this.updateProductImagesArray(product, rawImageFile, small, enums.ImageType.small, nextOrderNum);
                this.updateProductImagesArray(product, rawImageFile, medium, enums.ImageType.medium, nextOrderNum);
                this.updateProductImagesArray(product, rawImageFile, large, enums.ImageType.large, nextOrderNum);

                // Save the updated product.
                const updatedProduct = await new ProductRepository().save(product);

                response.status(200).json(updatedProduct);
            } catch (err) {
                this.cleanupProductImages(rawImageFile,true);
                ApiErrorHandler.sendError(`Error during image processing. ${err}`, 500, response, null, err);
            }
            finally {
                this.cleanupProductImages(rawImageFile, false);                
            }
        }
        else {
            ApiErrorHandler.sendError(`File wasn't present on the request.  Are you sure you sent the file with field named 'file'`, 500, response, null, null);
        }
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

    public updateProductImagesArray(product: IProduct, file: MulterFile, sharpInfo: sharp.OutputInfo, type: enums.ImageType, order: number, ): IProduct {
        product.images.push({
            isActive: true,
            type: type,
            height: sharpInfo.height,
            width: sharpInfo.width,
            url: `${Config.active.get('ProductImageURLLocationRoot')}${Config.active.get('ProductImageBucketName')}/${this.variationName(type, file)}`,
            order: order
        });
        return product;
    }

    public async formatImage(imageType: enums.ImageType, rawImageFile: MulterFile, response: Response, width: number = null, height: number = null, quality: number = 80): Promise<sharp.OutputInfo | any> {
        // If you don't turn off cache when you're trying to cleanup the files, you won't be able to delete the file.
        sharp.cache(false);

        const outputInfo: sharp.OutputInfo = await sharp(path.resolve(__dirname, '../../', `${CONST.IMAGE_UPLOAD_PATH}${rawImageFile.filename}`))
            .resize(width, height)
            .crop(sharp.gravity.center)
            .toFormat(sharp.format.png, {
                quality: quality,
            })
            .toFile(`${CONST.IMAGE_UPLOAD_PATH}${this.variationName(imageType, rawImageFile)}`);

        return await this.uploadImageToS3(response, rawImageFile, imageType, outputInfo);
    }

    public async uploadImageToS3(response: Response, rawImageFile: MulterFile, imageType: enums.ImageType, outputInfo: sharp.OutputInfo): Promise<sharp.OutputInfo> {
        let data = null;
        try {
            data = await fs.readFile(path.resolve(__dirname, '../../', `${CONST.IMAGE_UPLOAD_PATH}${this.variationName(imageType, rawImageFile)}`));
        } catch (err) {
            ApiErrorHandler.sendError(`Problem reading the contents of resized file back out. ${err}`, 500, response, null, err);
            return;
        }

        //while we still have easy access to the file we're going to send it up to s3.

        this.configureAws();

        const s3 = new AWS.S3({
            apiVersion: '2006-03-01',
            params: {
                Bucket: Config.active.get('ProductImageBucketName'),
                ACL: 'public-read',
                Metadata: {
                    ContentType: rawImageFile.mimetype
                }
            }
        });

        try {
            let s3data = await s3.putObject({
                Body: data,
                Bucket: Config.active.get('ProductImageBucketName'),
                Key: `${this.variationName(imageType, rawImageFile)}`,
                Metadata: {
                    ContentType: rawImageFile.mimetype
                },
                ContentType: rawImageFile.mimetype
            }).promise();

            log.info(`Uploaded image to s3:${JSON.stringify(s3data.$response.data)}`);
            return outputInfo;
        } catch (err) {
            ApiErrorHandler.sendError(`Failure during s3 upload. ${err}`, 500, response, null, err);
        }
    }

    public async cleanupProductImages(rawImageFile: MulterFile, cleanS3: boolean) {
        try {
            // first we're going to try and clean up the image file that was uploaded to the server.
            await fs.delete(path.resolve(__dirname, '../../', `${CONST.IMAGE_UPLOAD_PATH}${rawImageFile.filename}`));
        } catch (err) {
            log.error(`SWALLOWING! There was an error trying to delete the file that was created during upload.
            Upload path could fill. filename: ${rawImageFile.filename}  Exception: ${err}`);
        }

        try {
            // Now we're going to try and cleanup the images on s3
            //while we still have easy access to the file we're going to send it up to s3.
            this.cleanupProductImageVariations(rawImageFile, enums.ImageType.raw, cleanS3);
            this.cleanupProductImageVariations(rawImageFile, enums.ImageType.icon, cleanS3);
            this.cleanupProductImageVariations(rawImageFile, enums.ImageType.thumbnail, cleanS3);
            this.cleanupProductImageVariations(rawImageFile, enums.ImageType.small, cleanS3);
            this.cleanupProductImageVariations(rawImageFile, enums.ImageType.medium, cleanS3);
            this.cleanupProductImageVariations(rawImageFile, enums.ImageType.large, cleanS3);

        } catch (err) {
            log.error(`SWALLOWING!  There was an error trying to cleanup the files from the server, and S3.
            Upload path could fill. filename: ${rawImageFile.filename}  Exception: ${err}`);
        }

    }

    public async cleanupProductImageVariations(rawImageFile: MulterFile, imageType: enums.ImageType, cleanS3: boolean): Promise<void> {
        try {
            // now we're going to try and clean up all the variations that were created.
            await fs.delete(path.resolve(__dirname, '../../', `${CONST.IMAGE_UPLOAD_PATH}${this.variationName(imageType, rawImageFile)}`));
        } catch (err) {
            log.error(`SWALLOWING! While trying to cleanup image variations there was an error. filename: ${this.variationName(imageType, rawImageFile)}
             Exception: ${err}`);
        }

        try {
            if(cleanS3){
                this.configureAws();
                
                            const s3 = new AWS.S3({
                                apiVersion: '2006-03-01',
                                params: {
                                    Bucket: Config.active.get('ProductImageBucketName'),
                                    ACL: 'public-read',
                                    Metadata: {
                                        ContentType: rawImageFile.mimetype
                                    }
                                }
                            });
                
                            let s3data = await s3.deleteObject({
                                Bucket: Config.active.get('ProductImageBucketName'),
                                Key: `${this.variationName(imageType, rawImageFile)}`
                            }).promise();
                
                            log.info(`Cleanup: Deleted Object from S3: ${JSON.stringify(s3data.$response.data)}`);
            }
        } catch (err) {
            log.error(`SWALLOWING! Exception while trying to clean the image from S3 KEY: ${this.variationName(imageType, rawImageFile)}
            Exception: ${err}`);
        }
    }

    public configureAws() {
        AWS.config.update({
            accessKeyId: Config.active.get('AWSAccessKey'),
            secretAccessKey: Config.active.get('AWSSecret'),
            region: 'us-east-2',
        });
    }

    public variationName(imageType: enums.ImageType, rawImageFile: MulterFile): string {
        return `${enums.ImageType[imageType]}-${rawImageFile.filename}`;
    }
}
