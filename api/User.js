import { UserModel } from './Models';

/**
 * Resolvers, this enables us to use the GraphQL API
 * @type {Func}
 */
export const userResolvers = {
  Query: {
    /**
     * Receives an email and returns a User.
     */
    findByEmail: (root, args) => {
      return UserModel.findOne({
        email: args.email
      });
    },
    /**
     * Returns a list with all the users
     */
    listAll() {
      return UserModel.find({});
    }
  }
};

/**
 * Separating shared Type
 * @type {UserGraphQLType}
 */
export const UserGraphQLType = `
  type User {
    name: String
    email: String
    password: String
    level: Int
  }`;

/**
 * The User Schema for the GraphQL API
 * @type {GraphQL Schema}
 */
export const UserSchema = `
  ${UserGraphQLType}
  type Query {
    findByEmail(email: String): User
    listAll: [User]
  }
  schema {
    query: Query
  }`;
