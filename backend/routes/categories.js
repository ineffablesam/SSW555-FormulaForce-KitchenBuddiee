import express from 'express';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  getCategoryByName,
  updateCategory,
  deleteCategory,
} from '../data/categories.js';

const router = express.Router();

// GET /api/categories (get all categories for a user)
router.get('/:username', async (req, res, next) => {
  try {
    const { username } = req.params;
    const categories = await getAllCategories(username);
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
});

// GET /api/categories/:username/:categoryName
router.get('/:username/:categoryName', async (req, res, next) => {
  try {
    const { username, categoryName } = req.params;
    const category = await getCategoryByName(username, categoryName);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ success: true, category });
  } catch (err) {
    next(err);
  }
});

// POST /api/categories (create new category)
router.post('/', async (req, res, next) => {
  try {
    const { username, name, description, color } = req.body;

    console.log('Creating category with:', { name, description, username, color});

    if (!name) {
      return res.status(400).json({
        error: 'Missing required field',
        message: 'Category name is required',
      });
    }

    const newCategory = await createCategory({
      name: name.trim(),
      description: description?.trim() || '',
      username,
      color: color.trim(),
    });

    res.status(201).json({
      success: true,
      category: newCategory,
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
});

// PUT /api/categories/:id (update)
router.put('/:id', async (req, res, next) => {
  try {
    const { username, name, color } = req.body; 
    const updatedCategory = await updateCategory(req.params.id, {name, color}, username);
    if (!updatedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ success: true, category: updatedCategory });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const username = req.user?.username;
    const deleted = await deleteCategory(req.params.id, username);
    if (!deleted) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
