import { users } from '../config/mongoCollections.js';
import { dbConnection } from '../config/mongoConnection.js';
import bcrypt from 'bcrypt';
const saltRounds = 16;

const createStatusError = (message, status) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const ensureString = (value, field) => {
  if (value === undefined || value === null) {
    throw createStatusError(`You must provide a ${field}.`, 400);
  }
  if (typeof value !== 'string') {
    throw createStatusError(`${field[0].toUpperCase()}${field.slice(1)} must be of type string.`, 400);
  }
  return value.trim();
};

const normalizeUsername = (rawUsername) => {
  const username = ensureString(rawUsername, 'username').toLowerCase();
  if (!username) {
    throw createStatusError('You must provide a username.', 400);
  }
  return username;
};

const normalizePassword = (rawPassword) => {
  const password = ensureString(rawPassword, 'password');
  if (!password) {
    throw createStatusError('You must provide a password.', 400);
  }
  return password;
};

export const createUser = async (username, password) => {
  const normalizedUsername = normalizeUsername(username);
  const normalizedPassword = normalizePassword(password);

  if (!/^[A-Za-z]+$/.test(normalizedUsername) || normalizedUsername.length < 5 || normalizedUsername.length > 15) {
    throw createStatusError('Username should be only letters and has to be no less than 5 characters and no more than 15.', 400);
  }

  if (normalizedPassword.length < 8) {
    throw createStatusError('Password must by at least 8 characters long.', 400);
  }
  if (!/[A-Z]/.test(normalizedPassword)) {
    throw createStatusError('Password must have at least one uppercase letter.', 400);
  }
  if (!/\d/.test(normalizedPassword)) {
    throw createStatusError('Password must have at least one number.', 400);
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(normalizedPassword)) {
    throw createStatusError('Password must have at least one special character.', 400);
  }

  const hashPassword = await bcrypt.hash(normalizedPassword, saltRounds);
  const newUser = {
    username: normalizedUsername,
    password: hashPassword,
  };
  const userCollection = await users();
  const user = await userCollection.findOne({ username: normalizedUsername });
  if (user) {
    throw createStatusError("You are already a user, you can't sign up.", 409);
  }
  const insertInfo = await userCollection.insertOne(newUser);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw createStatusError('Could not add user', 500);
  }
  return { registrationCompleted: true };
};

export const authenticateUser = async (username, password) => {
  const normalizedUsername = normalizeUsername(username);
  const normalizedPassword = normalizePassword(password);

  const userCollection = await users();
  const user = await userCollection.findOne({ username: normalizedUsername });
  if (!user) {
    throw createStatusError('No user found with the provided username.', 404);
  }

  const passwordMatches = await bcrypt.compare(normalizedPassword, user.password);
  if (!passwordMatches) {
    throw createStatusError('Incorrect password provided.', 401);
  }

  return { authenticated: true, username: user.username };
};

export const deleteUserAndData = async (username, password) => {
  const normalizedUsername = normalizeUsername(username);
  const normalizedPassword = normalizePassword(password);

  const userCollection = await users();
  const user = await userCollection.findOne({ username: normalizedUsername });
  if (!user) {
    throw createStatusError('No user found with the provided username.', 404);
  }

  const passwordMatches = await bcrypt.compare(normalizedPassword, user.password);
  if (!passwordMatches) {
    throw createStatusError('Incorrect password provided.', 401);
  }

  const db = await dbConnection();
  const recipesCollection = db.collection('recipes');

  await recipesCollection.deleteMany({ username: normalizedUsername });

  const { deletedCount } = await userCollection.deleteOne({ username: normalizedUsername });
  if (!deletedCount) {
    throw createStatusError('Failed to delete user account.', 500);
  }

  return { deleted: true };
};
