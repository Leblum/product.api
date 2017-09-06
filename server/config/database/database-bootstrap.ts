import { IPermission, Permission, Role, IRole, User, IUser, IOrganization, Organization, IUserDoc, IOrganizationDoc } from "../../models";
import { Config } from "../config";
import { CONST } from "../../constants";
import { OrganizationType } from "../../enumerations";
const util = require('util');
var bcrypt = require('bcrypt');
import log = require('winston');

export class DatabaseBootstrap {

    public static entered: boolean = false;

    public static async seed() {
        let wait = ms => new Promise(resolve => setTimeout(resolve, ms));
        const setTimeoutPromise = util.promisify(setTimeout);

        if (await Organization.count({}) === 0) {
            // when unit testing, multiple threads seem to want to run this.  this prevents that race condition from happening.
            // it's not exactly my proudest moment, but I can't seem to find another way. 
            if(!this.entered){
                this.entered = true;
                if (await Organization.count({}) === 0) {
                    try {
                        log.info('About to bootstrap the database.  This will insert a system org, and system user, along with default roles, and permissions');
                        // For now all roles have all permissionss.  We're going to do our security on roles for now. 
                        // Later we can modify these permissions to be just what we need.
                        let permissions = await this.createAllPermissions();
    
                        // We create the system organization first.
                        let systemOrg: IOrganization = {
                            name: 'system',
                            isSystem: true,
                            type: OrganizationType.system,
                        };
    
                        let savedSystemOrg: IOrganizationDoc = await new Organization(systemOrg).save();
    
                        // Then we create a system user.
                        let systemUser: IUser = {
                            firstName: 'system',
                            lastName: 'system',
                            email: 'system@leblum.com',
                            password: await bcrypt.hash(Config.active.get('systemUserPassword'), CONST.SALT_ROUNDS),
                            roles: [await this.createSingleRole('admin', 'amdministrator', permissions)],
                            isTokenExpired: false,
                            organizationId: savedSystemOrg.id,
                            isEmailVerified: true,
                        };
    
                        let savedSystemUser: IUserDoc = await new User(systemUser).save();
    
                        //Now we need to link the system user back up to the database.
                        savedSystemOrg.users = [savedSystemUser];
                        await savedSystemOrg.save();
    
                        // Next we need to create a guest organization.  This will act as a holding place
                        // for accounts that haven't been email verified, or in the middle of the signup process before an org has been created.
                        let guestOrg: IOrganization = {
                            name: 'guest',
                            isSystem: false,
                            type: OrganizationType.guest,
                        };
    
                        let guestOrgDoc = await new Organization(guestOrg).save();
    
                        //now we create all the remaining roles
                        await this.createSingleRole('guest', 'guest', permissions);
                        await this.createSingleRole('impersonator', 'impersonator', permissions);
                        await this.createSingleRole('supplier:owner', 'supplier owner access to sensitive info', permissions);
                        await this.createSingleRole('supplier:user', 'supplier employee no access to sensitive info', permissions);
                        this.entered = false;
                    }
                    catch (err) {
                        this.entered = false;
                        log.error('There was an error seeding the database.  If this is in a unit test its fine', err);
                    }
                }
                
            }
            // await wait(Math.floor((Math.random() * 3000) + 1));
            // if (await Organization.count({}) === 0) {
                
            // }
        }
    }

    private static async createSingleRole(name: string, description: string, permissions: Array<IPermission>): Promise<IRole> {
        let role = new Role({
            name: name,
            description: description,
            permissions: permissions,
        });
        await role.save();
        return role;
    }

    private static async createAllPermissions(): Promise<Array<IPermission>> {
        let permissions: Array<IPermission> = new Array<IPermission>();
        permissions.push(await this.createSinglePermission('query', 'query', 'ability to query'));
        permissions.push(await this.createSinglePermission('delete', 'delete', 'ability to delete'));
        permissions.push(await this.createSinglePermission('blank', 'blank', 'ability to blank'));
        permissions.push(await this.createSinglePermission('utility', 'utility', 'ability to utility'));
        permissions.push(await this.createSinglePermission('count', 'count', 'ability to count'));
        permissions.push(await this.createSinglePermission('clear', 'clear', 'ability to clear'));
        permissions.push(await this.createSinglePermission('single', 'single', 'ability to single'));
        permissions.push(await this.createSinglePermission('create', 'create', 'ability to create'));
        permissions.push(await this.createSinglePermission('update', 'update', 'ability to update'));
        return permissions;
    }

    private static async createSinglePermission(name: string, value: string, description: string): Promise<IPermission> {
        let permission = new Permission({
            name: name,
            description: description,
            value: value,
        })
        await permission.save();
        return permission;
    }
}