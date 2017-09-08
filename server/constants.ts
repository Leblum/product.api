export const CONST = {
    ep: {
        API: '/api',
        V1: '/v1',
        AUTHENTICATE: '/authenticate',
        USERS: '/users',
        REGISTER: '/register',
        API_DOCS: '/api-docs',
        API_SWAGGER_DEF: '/swagger-definition',
        PERMISSIONS: '/permissions',
        ROLES: '/roles',
        ORGANIZATIONS: '/organizations',
        PRODUCT_TEMPLATES: '/product-templates',
        PRODUCTS: '/products',
        client: {
        },
        common:{
            QUERY: '/query'
        }
    },
    TOKEN_HEADER_KEY: "x-access-token",
    PRODUCT_ADMIN_ROLE: 'product:admin',
    PRODUCT_EDITOR_ROLE: 'product:editor',
    MOMENT_DATE_FORMAT: 'YYYY-MM-DD h:mm:ss a Z',
    LEBLUM_API_Q_BACKPLANE: 'leblum-api-q-backplane',
    REQUEST_TOKEN_LOCATION: 'api-decoded-token',
    SALT_ROUNDS: 10,
    errorCodes: {
        EMAIL_TAKEN: 'EmailAlreadyTaken',
        PASSWORD_FAILED_CHECKS: 'PasswordFailedChecks',
        EMAIL_VERIFICATION_EXPIRED: 'EmailVerificationHasExpired',
        PASSWORD_RESET_TOKEN_EXPIRED: 'PasswordResetTokenExpired'
    },
    testing:{
        PRODUCT_ADMIN_EMAIL: "integration.product.adminRole@leblum.com",
        PRODUCT_EDITOR_EMAIL: "integration.product.editorRole@leblum.com",
        ORGANIZATION_NAME: "IntegrationTestOrganization"
    }
}