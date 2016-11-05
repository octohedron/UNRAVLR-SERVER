/**
 *
 * About this test
 *
 * -- Uses
 *   + GraphQL Schemas
 *   + GraphQL Resolvers
 *   + MongoDB Connection, Schemas and Models
 *   + casual for generating mock data
 *   + request-promise for fetching external APIs and testing their integration
 *
 * -- API
 *
 *  - Queries
 *   + author({firstName, lastName}) : Author --> returns an Author JSON object
 *   + fortuneCookie : String --> returns a fortune cookie from the external API
 *
 *  - Mutations
 *   + createAuthor(author) : Author --> returns an Author JSON object
 *   + createPost([tags], title, text, authorId) --> returns a Post JSON object
 *
 *  - Types
 *   + Author: {id, firstName, lastName, posts}
 *   + Post: { [tags], title, text, views, author }
 *
 *
 * -- Example query for /graphiql
 *     {
 *       fortuneCookie
 *     }
 *
 */

import Mongoose from 'mongoose';
import casual from 'casual';
import rp from 'request-promise';
import _ from 'lodash';
import { mongoConfig, jwtConfig } from '../config';
const jwt = require('jsonwebtoken');

/**
 * MongoDB database connection, currently set to development
 * @param  {Entry Point} 'mongodb:               if (err Throws an error if it can't connect
 * @return {Database connection}           Establishes a connection
 */
Mongoose.connect(mongoConfig.development, (err) => {
  if (err) {
    console.error('Could not connect to MongoDB on port 27017');
  }
});

/**
 * Schema for handling the view count in Posts, for MongoDB
 * @type {Schema}
 */
const ViewSchema = Mongoose.Schema({
  postId: Number,
  views: Number
});

/**
 * Schema that defines an Author type for MongoDB
 * @type {Schema}
 */
const AuthorSchema = Mongoose.Schema({
  firstName: {
    type: String
  },
  lastName: {
    type: String
  }
});

/**
 * Schema that defines a Post type for MongoDB
 * @type {Schema}
 */
const PostSchema = Mongoose.Schema({
  title: {
    type: String
  },
  text: {
    type: String
  },
  tags: {
    type: String
  }
});

/**
 * User Schema for the MongoDB database
 * @type {MongoDB Schema}
 */
const UserMongoSchema = new Mongoose.Schema({
  id: {
    type: Number
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  username: {
    type: String
  },
  password: {
    type: String
  },
  email: {
    type: String
  },
  level: {
    type: Number
  }
});

/**
 * User mongo DB collection handler
 * @type {MongoDB Collection}
 */
const Users = Mongoose.model('users', UserMongoSchema);

// Actual objects we are going to use to perform operations in the database
const View = Mongoose.model('views', ViewSchema);
const Author = Mongoose.model('author', AuthorSchema);
const Post = Mongoose.model('post', PostSchema);

// set mock data generator seed
casual.seed(123);

/**
 * Generates and inserts Mock data into the MongoDB instance
 *
 * @param  {Int}   10             Amount of Mock records to be generated and inserted into the MongoDB
 * @param  {Author} ()             Author takes the firstName and lastName arguments
 * @param  {String}   text:          casual.sentences(3)     Post data for the body
 * @param  {[String]}   tags:          casual.words(3) The tags for the blog post
 * @param  {Int}   views:         Amount of views for the Blog Post
 * @param  {Upsert} True       For MongoDB, makes sure we insert if the record isn't found when selecting
 * @return {String}                  Shows the result of the opreation to the console,
 *                                   should print one Record in the Shell for each Iteration
 */
_.times(10, () => {
  // create  author and return the write result for the next operation
  return Author.create({
    firstName: casual.first_name,
    lastName: casual.last_name
  }).then((author) => {
    // create post and return the write result for the next operation
    return Post.create({
      title: `A post by ${author.firstName} ${author.lastName}`,
      text: casual.sentences(3),
      tags: casual.words(3).split(' ').join(',')
    }).then((post) => {
      // update views on post and return the write result for the console
      return View.update({
        postId: post.id
      }, {
        views: casual.integer(0, 100)
      }, {
        upsert: true
      }).then((result) => {
        console.log(result);
      }).catch((err) => console.log(err));
    });
  });
});

/**
 * Empty query for testing external API integration
 *
 * @type {String} Fortune cookie message
 */
const FortuneCookie = {
  getOne() {
    return rp('http://swapi.co/api/planets/1/')
      .then((res) => {
        let response = JSON.parse(res);
        console.log(response.climate);
        return response.climate;
      });
  }
};

/**
 * This is the Schema for the API. This defines the API.
 * @type {JSON} Returns JSON
 */
export const BlogSchema = `
  type Author {
    id: Int! # the ! means that every author object _must_ have an id
    firstName: String
    lastName: String
    posts: [Post] # the list of Posts by this author
  }
  type Post {
   id: Int!
    tags: [String]
    title: String
    text: String
    views: Int
    author: Author
  }
  # the schema allows the following query:
  type Query {
    author(firstName: String, lastName: String): Author
    fortuneCookie: String
  }
  # this schema allows the following mutation:
  type Mutation {
    createAuthor(
      firstName: String!
      lastName: String!
    ): Author
    createPost(
      tags: [String!]!
      title: String!
      text: String!
      authorId: Int!
    ): Post
  }
  # we need to tell the server which types represent the root query
  # and root mutation types.
  schema {
    query: Query
    mutation: Mutation
  }
`;

/**
 * Login Schema for the /login route
 * @type {JSON} Returns JSON
 */
export const LoginSchema = `
  type Token {
    token: String
  }
  type Query {
    login(username: String, password: String): Token
  }
  schema {
    query: Query
  }
`;

/**
 * Resolvers for the Blog GraphQL Schema
 * @type {Functions} --> These are the resolvers functions, for more information of what
 *                       this is and how it works, please refer to the official GraphQL docs
 *                       or the Apollo docs website
 *
 */
export const blogResolvers = {
  Query: {
    author(_, {firstName, lastName}) {
      let where = {
        firstName,
        lastName
      };
      if (!lastName) {
        where = {
          firstName
        };
      }
      if (!firstName) {
        where = {
          lastName
        };
      }
      return Author.find({
        where
      });
    },
    fortuneCookie() {
      return FortuneCookie.getOne();
    }
  },
  Mutation: {
    createAuthor: (root, args) => {
      return Author.create(args);
    },
    createPost: (root, {authorId, tags, title, text}) => {
      return Author.findOne({
        where: {
          id: authorId
        }
      }).then((author) => {
        console.log('found', author);
        return author.createPost({
          tags: tags.join(','),
          title,
          text
        });
      });
    }
  },
  Author: {
    posts(author) {
      return author.getPosts();
    }
  },
  Post: {
    author(post) {
      return post.getAuthor();
    },
    tags(post) {
      return post.tags.split(',');
    },
    views(post) {
      return new Promise((resolve, reject) => {
        setTimeout(() => reject('MongoDB timeout when fetching field views (timeout is 500ms)'), 500);
        View.findOne({
          postId: post.id
        }).then((res) => resolve(res.views));
      });
    }
  }
};

/**
 * Resolvers for the Login Schema
 * @type {Functions} --> These are the resolvers functions, for more information of what
 *                       this is and how it works, please refer to the official GraphQL docs
 *                       or the Apollo docs website
 *
 */
export const loginResolvers = {
  Query: {
    login: (root, args) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => reject('MongoDB timeout when fetching field users (timeout is 3000ms)'), 3000);
        let where = {
          username: args.username,
          password: args.password
        };
        Users.findOne(
          where
        ).then((userData) => {
          resolve({
            token: jwt.sign(userData._doc, jwtConfig.secret)
          });
        });
      });
    }
  }
};

