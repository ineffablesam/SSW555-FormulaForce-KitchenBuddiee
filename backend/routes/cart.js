import express from 'express';
import createHttpError from 'http-errors';
import { getCartByUsername, upsertCart, deleteCart, removeCartItem, removeRecipeIngredients } from '../data/shoppingCart.js';

const router = express.Router();

// GET /api/cart/:username
router.get('/:username', async (req, res, next) => {
  try {
    const { username } = req.params;
    const cart = await getCartByUsername(username);
    res.json(cart);
  } catch (err) {
    if (err && err.status) return res.status(err.status).json({ message: err.message });
    return next(err);
  }
});

// PUT /api/cart/:username  - upsert full cart
router.put('/:username', async (req, res, next) => {
  try {
    const { username } = req.params;
    const { items } = req.body || {};
    if (!items) throw createHttpError(400, 'items required');
    const result = await upsertCart(username, items);
    res.json(result);
  } catch (err) {
    if (err && err.status) return res.status(err.status).json({ message: err.message });
    return next(err);
  }
});

// DELETE /api/cart/:username
router.delete('/:username', async (req, res, next) => {
  try {
    const { username } = req.params;
    const result = await deleteCart(username);
    res.json(result);
  } catch (err) {
    if (err && err.status) return res.status(err.status).json({ message: err.message });
    return next(err);
  }
});

// DELETE /api/cart/:username/items/:itemText - remove single ingredient by text
router.delete('/:username/items/:itemText', async (req, res, next) => {
  try {
    const { username, itemText } = req.params;
    const result = await removeCartItem(username, decodeURIComponent(itemText));
    res.json(result);
  } catch (err) {
    if (err && err.status) return res.status(err.status).json({ message: err.message });
    return next(err);
  }
});

// POST /api/cart/:username/remove-recipe - remove all ingredients of a recipe
// Body: { recipe: { ingredients: [...] } }
router.post('/:username/remove-recipe', async (req, res, next) => {
  try {
    const { username } = req.params;
    const { recipe } = req.body || {};
    if (!recipe) throw createHttpError(400, 'recipe required');
    const result = await removeRecipeIngredients(username, recipe);
    res.json(result);
  } catch (err) {
    if (err && err.status) return res.status(err.status).json({ message: err.message });
    return next(err);
  }
});

export default router;
