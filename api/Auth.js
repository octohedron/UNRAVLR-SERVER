const jwt = require('jsonwebtoken');
import { jwtConfig } from '../config';
import { UserModel } from './Models';
import { UserGraphQLType } from './User';
import { serverConfig } from '../config';

/**
 * Resolvers for the Login Schema
 * @type {Functions} => Resolvers functions, for more information of what
 *                       this is and how it works, please refer to the official GraphQL docs
 *                       or the Apollo docs website
 */
export const authResolvers = {
  Query: {
    login: (root, args) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => reject('MongoDB timeout'), serverConfig.timeout);
        UserModel.findOne({
          password: args.password,
          email: args.email
        }).then((userData) => {
          if (userData === null) {
            resolve(null);
          }
          resolve({
            token: jwt.sign(userData._doc, jwtConfig.secret)
          });
        });
      });
    }
  },
  Mutation: {
    /**
     *  First checks if the email is already in the database, if it is, returns null,
     *  otherwise, creates a new user.
     *
     *  Example mutation for creating a user
     *   mutation{
     *    register(name: "Michael",
     *     email: "a@a.com",
     *      password: "a",
     *      level: 0) {
     *      token
     *    }
     *   }
     */
    register: (root, args) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => reject('MongoDB timeout'), serverConfig.timeout);
        UserModel.findOne({
          email: args.email
        }).then((userData) => {
          if (userData === null) {
            // creates a new user, and uses it to generate the token that will be returned
            resolve({
              token: jwt.sign(UserModel.create({
                name: args.name,
                email: args.email,
                password: args.password,
                level: args.level
              }), jwtConfig.secret)
            });
          } else {
            resolve(null); // email already taken
          }
        });
      });
    },
    /**
     * Checks if it can find the user and sets the new password, returns null if it can't
     * find the email
     *
     *  Example mutation for changing password
     *  mutation{
     *   changePassword(email: "t@p.com", password: "a") {
     *     name
     *     password
     *   }
     *  }
     */
    changePassword: (root, args) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => reject('MongoDB timeout'), serverConfig.timeout);
        UserModel.findOneAndUpdate({
          email: args.email,
          password: args.password
        }, {
          $set: {
            password: args.password
          }
        }, {
          new: true
        }).then((userData) => {
          if (userData === null) {
            resolve(null);
          } else {
            resolve(userData);
          }
        });
      });
    },
    /**
     * Generates a random string of length 10
     * Checks if it can find the user and sets the new password, returns the new user
     * document if it finds it or null if it can't
     *
     *  Example mutation to reset your password
     *  mutation {
     *   resetPassword(email: "a@a.com") {
     *     name
     *     password
     *   }
     *  }
     */
    resetPassword: (root, args) => {
      return new Promise((resolve, reject) => {
        let newPassword = Math.random().toString(36).slice(16);
        setTimeout(() => reject('MongoDB timeout'), serverConfig.timeout);
        UserModel.findOneAndUpdate({
          email: args.email
        }, {
          $set: {
            password: newPassword
          }
        }, {
          new: true
        }).then((userData) => {
          if (userData === null) {
            resolve(null);
          } else {
            resolve(userData);
          }
        });
      });
    },
    /**
     * Takes email, password and newEmail
     * Sets the email for the user if it finds it to the newEmail
     *
     * Example mutation
     * mutation {
     *  changeEmail(email: "a@a.com", password: "a", newEmail: "b@b.com") {
     *     email
     *     name
     *     password
     *   }
     * }
     */
    changeEmail: (root, args) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => reject('MongoDB timeout'), serverConfig.timeout);
        UserModel.findOneAndUpdate({
          email: args.email,
          password: args.password
        }, {
          $set: {
            email: args.newEmail
          }
        }, {
          new: true
        }).then((userData) => {
          if (userData === null) {
            resolve(null);
          } else {
            resolve(userData);
          }
        });
      });
    },
    /**
     * Takes email, password and newName
     * Sets the name for the user if it finds it to the newName
     *
     * Example mutation
     * mutation {
     *  changeName(email: "a@a.com", password: "a", newName: "Mario") {
     *     email
     *     name // shows the new name
     *     password
     *   }
     * }
     */
    changeName: (root, args) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => reject('MongoDB timeout'), serverConfig.timeout);
        UserModel.findOneAndUpdate({
          email: args.email,
          password: args.password
        }, {
          $set: {
            name: args.newName
          }
        }, {
          new: true
        }).then((userData) => {
          if (userData === null) {
            resolve(null);
          } else {
            resolve(userData);
          }
        });
      });
    }
  }
};

/**
 * Auth schema for the /auth route
 */
export const AuthSchema = `
  ${UserGraphQLType}
  type Token {
  	token: String
  }
  type Query {
  	login(email: String, password: String): Token
  }
  type Mutation {
	  register(
			name: String!
			email: String!
			password: String!
			level: Int!
	  ): Token
	  changePassword(
			email: String!
			password: String!
	  ): User
	  resetPassword(
			email: String!
	  ): User
	  changeEmail(
			email: String!
			newEmail: String!
			password: String!
	  ): User
	  changeName(
	  	email: String!
	  	password: String!
	  	newName: String!
	  ): User
  }
  schema {
	  query: Query
	  mutation: Mutation
  }`;
