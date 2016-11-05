import Mongoose from 'mongoose';
import { mongoConfig } from '../config';

/**
 * Establish a database connection
 * @param  {Entry Point} mongodb: Throws an error if it can't connect
 */
Mongoose.connect(mongoConfig.development, (err) => {
  if (err) {
    console.error('Could not connect to MongoDB on port 27017');
  } else {
    console.log('Connected to the mongodb on port 27017');
  }
});

/**
 * User Schema for the MongoDB database
 * @type {MongoDB Schema}
 */
export const UserMongoSchema = new Mongoose.Schema({
  id: {
    type: Number
  },
  name: {
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
export const UserModel = Mongoose.model('users', UserMongoSchema);
