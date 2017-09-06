import { IRole } from './role';

export interface ITokenPayload {
    organizationId: string,
    userId: string,
    roles: string[],
    expiration: string
}