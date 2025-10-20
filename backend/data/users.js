import { users } from '../config/mongoCollections.js';
import bcrypt from 'bcryptjs';
import {ObjectId} from 'mongodb';

const saltRounds = 16;

export const createUser = async (username, password) => {
  if (!username) {
    const err = new Error("You must provide a username.");
    err.status = 400;
    throw err;
  }
  if (!password) {
    const err = new Error("You must provide a password.");
    err.status = 400;
    throw err;
  }

  if (typeof username !== "string") {
    const err = new Error("Username must be of type string.");
    err.status = 400;
    throw err;
  }
  if (typeof password !== "string") {
    const err = new Error("Password must be of type string.");
    err.status = 400;
    throw err;
  }
  username = username.trim().toLowerCase();
  password = password.trim();

  if (!/^[A-Za-z]+$/.test(username) || username.length < 5 || username.length > 15){
    const err = new Error("Username should be only letters and has to be no less than 5 characters and no more than 15.");
    err.status = 400;
    throw err;
  }

  if (password.length < 8){
    const err = new Error("Password must by at least 8 characters long.");
    err.status = 400;
    throw err;
  }
  if (!/[A-Z]/.test(password)){
    const err = new Error("Password must have at least one uppercase letter.");
    err.status = 400;
    throw err;
  }
  if (!/\d/.test(password)){
    const err = new Error("Password must have at least one number.");
    err.status = 400;
    throw err;
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]/.test(password)){
    const err = new Error("Password must have at least one special character.");
    err.status = 400;
    throw err;
  }
  const hashPassword = await bcrypt.hash(password, saltRounds);
  const newUser = {
    username,
    password: hashPassword
  };
  const userCollection = await users();
  const user = await userCollection.findOne({ username: username });
  if (user){
    const err = new Error("You are already a user, you can't sign up.");
    err.status = 409;
    throw err;
  }
  const insertInfo = await userCollection.insertOne(newUser);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    const err = new Error('Could not add user');
    err.status = 500;
    throw err;
  }
  return {registrationCompleted: true};
};