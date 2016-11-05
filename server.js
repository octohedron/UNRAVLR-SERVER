import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'express-jwt';
import { apolloExpress } from 'apollo-server';
import { UserSchema, userResolvers } from './api/User';
import { AuthSchema, authResolvers } from './api/Auth';
import { InstagramApi } from './api/Instagram';
import { ClarifaiApi } from './api/Clarifai';
import { makeExecutableSchema } from 'graphql-tools';
import { graphiqlExpress } from 'apollo-server';
import { serverConfig, jwtConfig } from './config';
const jwtTools = require('jsonwebtoken');

/**
 * User schema for the user API
 * @type {usable Schema for Apollo}
 */
const exeUserSchema = makeExecutableSchema({
  typeDefs: [UserSchema],
  resolvers: userResolvers
});

/**
 * Schemas for the auth API
 * @type {usable Schema for Apollo}
 */
const exeAuthSchema = makeExecutableSchema({
  typeDefs: [AuthSchema],
  resolvers: authResolvers
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
     * Setting up the requests to be used with a mock 'Bearer' user, for testing, default alg is HS256
     */
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      try {
        var decoded = jwtTools.verify(req.headers.authorization.split(' ')[1], jwtConfig.secret);
        // checks if the token is an object and has the level property
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
// We leave the /auth and the /authql paths as public because that is what we use to get the token
}).unless({
  path: ['/auth', '/authql', '/instagram/handle_auth', '/instagram/authorize_user', '/instagram/user', '/clarifai/tags']
}));

/**
 * Setting /user route for the API
 * @type {API}
 */
API.use('/user', bodyParser.json(), apolloExpress({
  schema: exeUserSchema
}));

/**
 * Auth GraphQL, doesn't need token
 * @type {route}
 */
API.use('/authql', bodyParser.json(), apolloExpress({
  schema: exeAuthSchema
}));

/**
 * Auth route, proxies to /authql, this route is accessible without a token
 * and it shows the graphiql GUI for testing purposes, proxies to /authql
 * @type {route}
 */
API.use('/auth', graphiqlExpress({
  endpointURL: '/authql'
}));

/**
 * Get tags by image url
 * QueryParams: url={imageUrl}
 * @type {route}
 */
API.get('/clarifai/tags', ClarifaiApi.GetTagsByUrl);

/**
 * Get instagram code for authentication
 * @type {route}
 */
API.get('/instagram/authorize_user', InstagramApi.AuthorizeUser);

/**
 * Get instagram token with code for authentication
 * @type {route}
 */
API.get('/instagram/handle_auth', InstagramApi.HandleAuth);

/**
 * Get instagram user
 * @type {route}
 */
API.get('/instagram/user', InstagramApi.UserSelf);

/**
 * Start the server
 */
API.listen(serverConfig.port);

console.log('Server listening on port ' + serverConfig.port);
