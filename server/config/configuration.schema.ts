import convict = require('convict');

export class ConfigurationSchema{
public static convictSchema: convict.Config = convict({
    env: {
      doc: 'The applicaton environment.',
      format: ['production', 'development', 'ci', 'test', 'staging', 'integration'],
      default: 'development',
      env: 'NODE_ENV'
    },
    port: {
      doc: 'The port to bind.',
      format: 'port',
      default: 8080,
      env: 'PORT'
    },
    name: {
      doc: 'The current app name could be useful for debugging',
      format: String,
      default: 'leblum unamed app',
      env: 'APP_NAME'
    },
    database: {
      mongoConnectionString: {
        doc: 'Mongo Connection string',
        format: '*',
        default: '',
        env: 'MONGO_CONNECTION_STRING',
        sensitive: true,
      },
    },
    ampq:{
      ampqConnectionString:{
        doc: 'AMPQ Connection string for rabbit',
        format: '*',
        default: 'amqp://wkaxkarj:NAsD1ISNCESHMmVlK9Mch6IcBjapIBYn@puma.rmq.cloudamqp.com/wkaxkarj',
        env: 'AMPQ_CONNECTION_STRING',
        sensitive: true
      }
    },
    jwtSecretToken: {
      doc: 'The secrect token were signing jwts with',
      format: String,
      default: 'asdf97a9s8d7baodfbhoda8f7g9adf8asj',
      env: 'JWT_SECRET_TOKEN',
      sensitive: true
    },
    systemUserPassword:{
      doc:'This is the password for the system user',
      format: String,
      default: 'ads9f8a8s7df6adfiug87daf6gsudifyiasd7',
      env: 'SYSTEM_USER_PASS',
      sensitive: true
    },
    returnCallStackOnError: {
      doc: 'When the api encounters an error do we return a call stack',
      format: Boolean,
      default: true,
      env: 'RETURN_CALL_STACK',
    },
    isConsoleLoggingActive: {
      doc: 'Do we want to log output to the console?',
      format: Boolean,
      default: true,
      env: 'CONSOLE_LOGGING',
    },
    isConsoleColored: {
      doc: 'Colorization Affects the logging, so be careful on which environments you turn this on.',
      format: Boolean,
      default: true,
      env: 'CONSOLE_COLOR',
    },
    mandrillApiKey:{
      doc:'DEFAULT HERE IS TEST KEY! This is the api key that we want to use with mandrill.  Keep in mind there is a different test for the integration environment',
      format: String,
      default: 'Zh8DlnQXZIW5urHG7f1Llw',
      env: 'MANDRILL_API_KEY',
      sensitive: true
    },
    clientDistFolder:{
      doc:'The client dist folder needs to be set, we build the docker image with all the client folders built.',
      format: String,
      default: 'dist',
      env: 'CLIENT_DIST_FOLDER',
      sensitive: false,
    }
  });
}