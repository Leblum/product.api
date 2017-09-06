export const CONST = {
    ep: {
        API: '/api',
        V1: '/v1',
        AUTHENTICATION: '/authenticate',
        API_DOCS: '/api-docs',
        API_SWAGGER_DEF: '/swagger-definition',
        PERMISSIONS: '/permissions',
        ROLES: '/roles',
        USERS: '/users',
        ORGANIZATIONS: '/organizations',
        REGISTER: '/register',
        EMAIL_VERIFICATIONS: '/email-verifications',
        PASSWORD_RESET: '/password-reset',
        PASSWORD_RESET_TOKENS: '/password-reset-tokens',
        VALIDATE_EMAIL: '/validate-email',
        PASSWORD_RESET_REQUEST: '/password-reset-request',
        client: {
            VERIFY_EMAIL: '/verify-email',
            RESET_PASSWORD: '/reset-password'
        }
    },
    MOMENT_DATE_FORMAT: 'YYYY-MM-DD h:mm:ss a Z',
    LEBLUM_API_Q_BACKPLANE: 'leblum-api-q-backplane',
    APPLICATION_NAME: "leblum.identity.api",
    REQUEST_TOKEN_LOCATION: 'api-decoded-token',
    SALT_ROUNDS: 10,
    errorCodes: {
        EMAIL_TAKEN: 'EmailAlreadyTaken',
        PASSWORD_FAILED_CHECKS: 'PasswordFailedChecks',
        EMAIL_VERIFICATION_EXPIRED: 'EmailVerificationHasExpired',
        PASSWORD_RESET_TOKEN_EXPIRED: 'PasswordResetTokenExpired'
    }
}