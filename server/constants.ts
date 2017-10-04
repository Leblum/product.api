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
        SUPPLIERS: '/suppliers',
        DELETE_IMAGE: '/delete-image',
        DELETE_IMAGE_GROUP: '/delete-image-group',
        CREATE_FROM_TEMPLATE: '/create-product-from-template',
        UPLOAD_IMAGES: '/upload-images',
        client: {
        },
        common:{
            QUERY: '/query'
        }
    },
    TOKEN_HEADER_KEY: "x-access-token",
    ADMIN_ROLE: 'admin',
    PRODUCT_ADMIN_ROLE: 'product:admin',
    PRODUCT_EDITOR_ROLE: 'product:editor',
    SUPPLIER_EDITOR_ROLE: 'supplier:editor',
    SUPPLIER_ADMIN_ROLE: 'supplier:admin',
    MOMENT_DATE_FORMAT: 'YYYY-MM-DD h:mm:ss a Z',
    LEBLUM_API_Q_BACKPLANE: 'leblum-api-q-backplane',
    REQUEST_TOKEN_LOCATION: 'api-decoded-token',
    SYSTEM_AUTH_TOKEN: 'system-auth-token',
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
        SUPPLIER_ADMIN_EMAIL: "integration.supplier.adminRole@leblum.com",
        SUPPLIER_EDITOR_EMAIL: "integration.supplier.editorRole@leblum.com",
        ORGANIZATION_NAME: "IntegrationTestOrganization"
    },
    IMAGE_UPLOAD_PATH: './img-uploads/',
}