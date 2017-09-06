import { NextFunction, Request, RequestHandler, RequestParamHandler, Response, Router } from 'express';
import { Document, DocumentQuery, Model, Schema } from 'mongoose';
import * as log from 'winston';
import { IValidationError, SearchCriteria, IBaseModel, IBaseModelDoc } from '../../models/';
import { ObjectId } from 'bson';
import { BaseRepository, IBaseRepository } from "../../repositories/";

export abstract class BaseController {

    protected abstract repository: IBaseRepository<IBaseModelDoc>;
    public abstract defaultPopulationArgument: object;

    public async isValid(model: IBaseModelDoc): Promise<IValidationError[]> {
        return null;
    };

    public async preCreateHook(model: IBaseModelDoc): Promise<IBaseModelDoc> {
        return model;
    }

    public async preUpdateHook(model: IBaseModelDoc): Promise<IBaseModelDoc> {
        return model;
    }
    
    protected getId(request: Request): string {
        return request && request.params ? request.params['id'] : null;
    }

    public blank(request: Request, response: Response, next: NextFunction): void {
        response.json(this.repository.blank());
    }

    public utility(request: Request, response: Response, next: NextFunction): void {
        response.json({});
    }

    public respondWithValidationErrors(request: Request, response: Response, next: NextFunction, validationErrors: IValidationError[]): void {
        response.status(412).json({
            validationError: 'Your Item did not pass validation',
            validationErorrs: validationErrors
        });
    }
    
    public async query(request: Request, response: Response, next: NextFunction): Promise<IBaseModelDoc[]> {
        try {
            let models: IBaseModelDoc[] = await this.repository.query(request.body, this.defaultPopulationArgument);

            response.json(models);

            log.info(`Queried for: ${this.repository.getCollectionName()}, Found: ${models.length}`);
            return models;
        } catch (err) { next(err); }
    }

    public async clear(request: Request, response: Response, next: NextFunction): Promise<void> {
        try {
            let count: number = await this.repository.count(new SearchCriteria(request, next));
            await this.repository.clear(request.body);

            response.json({
                Collection: this.repository.getCollectionName(),
                Message: 'All items cleared from collection',
                CountOfItemsRemoved: count
            });

            log.info(`Cleared the entire collection: ${this.repository.getCollectionName()}`);
        } catch (err) { next(err); }
    }

    public async destroy(request: Request, response: Response, next: NextFunction): Promise<IBaseModelDoc> {
        try {
            let deletedModel = await this.repository.destroy(this.getId(request));

            if (!deletedModel) { throw { message: "Item Not Found", status: 404 }; }

            response.json({
                ItemRemovedId: deletedModel.id,
                ItemRemoved: deletedModel,
            });
            log.info(`Removed a: ${this.repository.getCollectionName()}, ID: ${this.getId(request)}`);

            return deletedModel;
        } catch (err) { next(err); }
    }

    //Update full / partial, is the difference between put and patch.
    public updateFull(request: Request, response: Response, next: NextFunction): Promise<IBaseModelDoc | void> {
        return this.update(request, response, next, true);
    }

    public updatePartial(request: Request, response: Response, next: NextFunction): Promise<IBaseModelDoc | void> {
        return this.update(request, response, next, false);
    }

    private async update(request: Request, response: Response, next: NextFunction, isFull: boolean): Promise<IBaseModelDoc> {
        try {
            let model = await this.preUpdateHook(this.repository.createFromBody(request.body));

            //I think validation will break on partial updates.  Something to look for.
            let validationErrors = await this.isValid(model);

            if (validationErrors && validationErrors.length > 0) {
                this.respondWithValidationErrors(request, response, next, validationErrors);
                return null;
            }

            // notice that we're using the request body in the set operation NOT the item after the pre update hook.
            let updateBody: any;
            if (isFull) {
                // here we have a full document, so we don't need the set operation
                updateBody = model;
            }
            else {
                // here someone only passed in a few fields, so we use the set operation to only change the fields that were passed in.
                updateBody = { $set: request.body }
            }

            model = await this.repository.update(this.getId(request), updateBody);
            if (!model) { throw { message: 'Item Not found', status: 404 }; }

            response.status(202).json({ model });
            log.info(`Updated a: ${this.repository.getCollectionName()}, ID: ${model._id}`);
            return model;
        } catch (err) { next(err) }
    }

    public async create(request: Request, response: Response, next: NextFunction): Promise<IBaseModelDoc> {
        try {
            let model = await this.preCreateHook(this.repository.createFromBody(request.body));

            let validationErrors = await this.isValid(model);

            if (validationErrors && validationErrors.length > 0) {
                this.respondWithValidationErrors(request, response, next, validationErrors);
                return null;
            }

            model = await this.repository.create(model);

            response.status(201).json({ model });

            log.info(`Created New: ${this.repository.getCollectionName()}, ID: ${model._id}`);

            return model;
        } catch (err) { next(err) }
    }

    public async count(request: Request, response: Response, next: NextFunction): Promise<number> {
        try {
            const searchCriteria = new SearchCriteria(request, next);
            const count: number = await this.repository.count(searchCriteria);

            response.json({
                CollectionName: this.repository.getCollectionName(),
                CollectionCount: count,
                SearchCriteria: searchCriteria.criteria,
            });
            log.info(`Executed Count Operation: ${this.repository.getCollectionName()}, Count: ${count}`);
            return count;
        } catch (err) { next(err) }

    }

    public async list(request: Request, response: Response, next: NextFunction): Promise<IBaseModelDoc[]> {
        try {
            let models: IBaseModelDoc[] = await this.repository.list(new SearchCriteria(request, next), this.defaultPopulationArgument);

            response.json(models);

            log.info(`Executed List Operation: ${this.repository.getCollectionName()}, Count: ${models.length}`);

            return models;
        } catch (err) { next(err) }
    }

    public async single(request: Request, response: Response, next: NextFunction): Promise<IBaseModelDoc> {
        try {
            let model: IBaseModelDoc = await this.repository.single(this.getId(request), this.defaultPopulationArgument);
            if (!model)
                throw ({ message: 'Item Not Found', status: 404 });

            response.json(model);

            log.info(`Executed Single Operation: ${this.repository.getCollectionName()}, item._id: ${model._id}`);

            return model;
        } catch (err) { next(err) }
    }
}