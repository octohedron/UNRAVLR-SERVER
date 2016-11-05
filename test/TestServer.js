import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'express-jwt';
const jwtTools = require('jsonwebtoken');
import { apolloExpress } from 'apollo-server';
import { BlogSchema, LoginSchema, blogResolvers, loginResolvers } from './BlogTest';
import { makeExecutableSchema } from 'graphql-tools';
import { graphiqlExpress } from 'apollo-server';
import { serverConfig, jwtConfig } from '../config';

/**
 * Blog schema for apollo
 * @type {usable Schema for Apollo}
 */
const exeBlogSchema = makeExecutableSchema({
  typeDefs: [BlogSchema],
  resolvers: blogResolvers
});

/**
 * Login schema for /login route
 * @type {usable Schema for Apollo}
 */
const exeLoginSchema = makeExecutableSchema({
  typeDefs: [LoginSchema],
  resolvers: loginResolvers
});

/**
 * Entry point, server
 * @type {Abstraction on top of Node}
 */
var API = express();

/**
 * JWT Setup
 * @param  {String}    Secret: This is the seed for the key
 * @param  {Boolean}     credentialsRequired: If set to true, it forces requests to have the token
 * @return {String}      The token
 */
API.use(jwt({
  secret: jwtConfig.secret,
  credentialsRequired: jwtConfig.forceCredentials,
  getToken: function fromHeader(req) {
    /**
     * Setting up the requests to be used with a mock 'Bearer' user, for testing
     * @param  {String}   When issuing a request we need to pass the Authorization header with the user 'Bearer'
     *                      and the right key for this to work, generated with the secret set above, default alg is HS256
     * @return {String}     Returns the token or null if it's not present
     */
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      try {
        var decoded = jwtTools.verify(req.headers.authorization.split(' ')[1], jwtConfig.secret);
        // checks if the token is an object and has the level property.
        if (Object.keys(decoded).indexOf('level') !== -1) {
          console.log('\n' + 'Got authorized request from ' + req.headers.authorization.split(' ')[0] + '\n');
          return req.headers.authorization.split(' ')[1];
        } else {
          throw 'No level key in decoded object';
        }
      } catch ( err ) {
        console.log(err);
      }
    }
    console.log('token not found');
    return null;
  }
// We leave the /login and the /loginql paths out because that is what we use to get the token in the first place.
}).unless({
  path: ['/login', '/loginql']
}));

/**
 * Setting graphql route for the API
 * @type {RESTFUL API}
 */
API.use('/graphql', bodyParser.json(), apolloExpress({
  schema: exeBlogSchema
}));

/**
 * Enabling GraphiQL for development purposes for the graphql API
 * @type {route}
 */
API.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql'
}));

/**
 * Login GraphQL, doesn't need token
 * @type {route}
 */
API.use('/loginql', bodyParser.json(), apolloExpress({
  schema: exeLoginSchema
}));

/**
 * Enabling GraphiQL for development purposes
 * @type {route}
 */
API.use('/login', graphiqlExpress({
  endpointURL: '/loginql'
}));

/**
 * Start the server
 */
API.listen(serverConfig.port);

console.log('\n' + '===================  ===================');
console.log('=====> Test server running at port ' + serverConfig.port);
console.log('===================  ===================' + '\n');
