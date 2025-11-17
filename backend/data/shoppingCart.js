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

// Remove a single ingredient (by exact text match) from a user's cart.
// Returns the updated items array and a flag indicating whether removal occurred.
export const removeCartItem = async (username, itemText) => {
  const u = ensureString(username, 'username');
  const text = ensureString(itemText, 'itemText');
  const col = await cart();
  const doc = await col.findOne({ username: u });
  if (!doc || !Array.isArray(doc.items)) {
    // Nothing to remove; ensure cart existence pattern matches getCartByUsername
    return { username: u, items: [], removed: false };
  }
  const originalLength = doc.items.length;
  const filtered = doc.items.filter((it) => it.text !== text);
  if (filtered.length === originalLength) {
    return { username: u, items: doc.items, removed: false };
  }
  const update = { $set: { items: filtered, updatedAt: new Date() } };
  const result = await col.updateOne({ username: u }, update);
  if (!result.acknowledged) throw createStatusError('Failed to update cart', 500);
  return { username: u, items: filtered, removed: true };
};

// Remove all ingredients belonging to a recipe. Decrements qty counts; removes item if qty hits 0.
// recipe: { ingredients: [string,...] }
// Returns { username, items, removed: true/false, changedCount, removedTexts }
export const removeRecipeIngredients = async (username, recipe) => {
  const u = ensureString(username, 'username');
  if (!recipe || typeof recipe !== 'object') throw createStatusError('recipe must be an object', 400);
  const ingArr = recipe.ingredients;
  if (!Array.isArray(ingArr)) throw createStatusError('recipe.ingredients must be an array', 400);
  if (ingArr.length === 0) return { username: u, items: (await getCartByUsername(u)).items, removed: false, changedCount: 0, removedTexts: [] };

  // Build count map for occurrences inside recipe
  const removeCounts = new Map();
  ingArr.forEach((raw) => {
    if (typeof raw === 'string') {
      const key = raw.trim();
      if (!key) return;
      removeCounts.set(key, (removeCounts.get(key) || 0) + 1);
    }
  });

  if (removeCounts.size === 0) return { username: u, items: (await getCartByUsername(u)).items, removed: false, changedCount: 0, removedTexts: [] };

  const col = await cart();
  const doc = await col.findOne({ username: u });
  if (!doc || !Array.isArray(doc.items) || doc.items.length === 0) {
    return { username: u, items: [], removed: false, changedCount: 0, removedTexts: [] };
  }

  let changedCount = 0;
  const removedTexts = [];
  const updated = doc.items.map((it) => ({ ...it }));
  for (let i = updated.length - 1; i >= 0; i--) {
    const it = updated[i];
    const countToRemove = removeCounts.get(it.text);
    if (!countToRemove) continue;
    const prevQty = it.qty || 1;
    const newQty = prevQty - countToRemove;
    changedCount++;
    if (newQty <= 0) {
      removedTexts.push(it.text);
      updated.splice(i, 1);
    } else {
      it.qty = newQty;
    }
  }

  if (changedCount === 0) {
    return { username: u, items: doc.items, removed: false, changedCount: 0, removedTexts: [] };
  }

  const writeResult = await col.updateOne({ username: u }, { $set: { items: updated, updatedAt: new Date() } });
  if (!writeResult.acknowledged) throw createStatusError('Failed to update cart', 500);
  return { username: u, items: updated, removed: true, changedCount, removedTexts };
};

export default {
  getCartByUsername,
  upsertCart,
  deleteCart,
  removeCartItem,
  removeRecipeIngredients,
};

