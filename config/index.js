// Master configuration file, all or most configuration should go here along with the rest of the settings.

/**
 * All configuration regarding the Mongo Database is defined in this constant
 * @type {JSON}
 */
export const mongoConfig = {
  development: 'mongodb://localhost/views',
  devStaging: 'mongodb://power2dm:power2017health@cockney.4.mongolayer.com:10185,cockney.5.mongolayer.com:10185/power2dm?replicaSet=set-5721e1ea3a3f4c6810000680',
  production: 'unset'
};

/**
 * All configuration regarding the Server is defined in this constant
 * @type {JSON}
 */
export const serverConfig = {
  port: 3000,
  timeout: 1000
};

/**
 * All JWT configuration is defined in this constant
 * @type {JSON}
 */
export const jwtConfig = {
  secret: 'secret',
  forceCredentials: true
};
