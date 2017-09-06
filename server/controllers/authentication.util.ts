import { Router, Request, Response, RequestParamHandler, NextFunction, RequestHandler, Application } from 'express';

export class AuthenticationUtil{
    
    public static sendAuthFailure(response: Response, status: number, description: string): Response {
        return response.status(status).json({
            message: 'Authentication Failed',
            description: description
        });
    }
}