import express from 'express';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  getCategoryByName,
  updateCategory,
  deleteCategory,
} from '../data/categories.js';
import { dbConnection } from '../config/mongoConnection.js';
import { ObjectId } from 'mongodb';

const CATEGORIES_COLLECTION = 'categories';

const router = express.Router();

async function removeCategoryFromRecipes(categoryIds) {
  const db = await dbConnection();
  const recipes = db.collection("recipes");

  // Convert categoryIds to ObjectId[]
  const objectIds = categoryIds.map((id) => new ObjectId(id));

  // Pull any category objects whose _id matches
  const result = await recipes.updateMany(
    { "category._id": { $in: objectIds } }, // find recipes containing any of these categories
    { $pull: { category: { _id: { $in: objectIds } } } } // remove them
  );
};

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
    const { username, name, description, color, image } = req.body;

    console.log('Creating category with:', { name, description, username, color, imageSize: image ? image.length : 0 });

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
      image,
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
    const { username, name, color, image } = req.body;

    console.log(`[PUT] Updating category ${req.params.id} for user ${username}`);
    console.log(`[PUT] Payload: name=${name}, color=${color}, imageSize=${image ? image.length : 'missing/null'}`);

    const updatedCategory = await updateCategory(req.params.id, { name, color, image }, username);
    if (!updatedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ success: true, category: updatedCategory });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/categories/batch
router.delete('/batch', async (req, res, next) => {
  try {
    const { ids } = req.body; // array of string IDs from frontend

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'ids must be an array' });
    }

    const db = await dbConnection();
    const collection = db.collection(CATEGORIES_COLLECTION);

    // Convert to ObjectId[]
    const objectIds = ids.map((id) => new ObjectId(id));

    const result = await collection.deleteMany({
      _id: { $in: objectIds }
    });

    await removeCategoryFromRecipes(ids);

    res.json({
      success: true,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error('Batch delete error:', err);
    next(err);
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
    await removeCategoryFromRecipes([req.params.id]);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
});



/**
 * PATCH /api/categories/:categoryName/add-recipe
 * Add a recipe to the category's recipes array (prevent duplicates)
 */
router.patch('/:categoryName/add-recipe', async (req, res, next) => {
    try {
        const { categoryName } = req.params;
        const { recipe } = req.body; // recipe: { _id, title, username }
        const username = recipe?.username;

        if (!username) {
            return res.status(400).json({ error: 'Missing recipe username' });
        }

        if (!recipe || !recipe._id || !recipe.title) {
            return res.status(400).json({ error: 'Missing recipe data (_id and title required)' });
        }

        const db = await dbConnection();
        const collection = db.collection(CATEGORIES_COLLECTION);

        // Find the category by name and username
        const category = await collection.findOne({ name: categoryName, username });
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const currentRecipes = category.recipes || [];

        // Prevent duplicates
        const exists = currentRecipes.some(r => r._id.toString() === recipe._id.toString());
        if (!exists) {
            currentRecipes.push({ _id: new ObjectId(recipe._id), title: recipe.title });
        }

        const updatedCategory = await collection.findOneAndUpdate(
            { _id: category._id, username },
            { $set: { recipes: currentRecipes } },
            { returnDocument: 'after' }
        );

        res.json({
            success: true,
            message: 'Recipe added to category',
            category: updatedCategory.value
        });

    } catch (err) {
        console.error('Error adding recipe to category:', err);
        next(err);
    }
});

export default router;
