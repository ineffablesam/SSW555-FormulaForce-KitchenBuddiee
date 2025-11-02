import { cart } from '../config/mongoCollections.js';

const createStatusError = (message, status) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const ensureString = (val, name) => {
  if (val === undefined || val === null) throw createStatusError(`${name} is required`, 400);
  if (typeof val !== 'string') throw createStatusError(`${name} must be a string`, 400);
  return val.trim();
};

const ensureItems = (items) => {
  if (!Array.isArray(items)) throw createStatusError('items must be an array', 400);
  items.forEach((it) => {
    if (!it || typeof it !== 'object') throw createStatusError('each item must be an object', 400);
    if (typeof it.text !== 'string') throw createStatusError('item.text must be a string', 400);
    if (it.qty !== undefined && typeof it.qty !== 'number') throw createStatusError('item.qty must be a number', 400);
    if (it.checked !== undefined && typeof it.checked !== 'boolean') throw createStatusError('item.checked must be boolean', 400);
  });
};

export const getCartByUsername = async (username) => {
  const u = ensureString(username, 'username');
  const col = await cart();
  const doc = await col.findOne({ username: u });
  if (!doc) return { username: u, items: [] };
  return { username: doc.username, items: doc.items || [] };
};

export const upsertCart = async (username, items) => {
  const u = ensureString(username, 'username');
  ensureItems(items);
  const col = await cart();
  const update = {
    $set: {
      username: u,
      items,
      updatedAt: new Date(),
    },
  };
  const opts = { upsert: true };
  const result = await col.updateOne({ username: u }, update, opts);
  if (result.acknowledged === false) throw createStatusError('Could not save cart', 500);
  return { success: true };
};

export const deleteCart = async (username) => {
  const u = ensureString(username, 'username');
  const col = await cart();
  const result = await col.deleteOne({ username: u });
  if (result.deletedCount === 0) throw createStatusError('No cart found to delete', 404);
  return { deleted: true };
};

export default {
  getCartByUsername,
  upsertCart,
  deleteCart,
};

