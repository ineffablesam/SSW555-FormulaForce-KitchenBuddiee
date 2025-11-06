import express from 'express';
import { createRecipe, getAllRecipes, getRecipesByUser, getRecipeById, updateRecipe, deleteRecipe } from '../data/recipes.js';

const router = express.Router();

// GET /api/recipes (get ALL recipes)
router.get('/', async (req, res, next) => {
    try {
        console.log('📚 Fetching all recipes');
        const recipes = await getAllRecipes();
        console.log(`✅ Found ${recipes.length} recipes`);
        res.json({
            success: true,
            recipes
        });
    } catch (error) {
        console.error('❌ Error fetching all recipes:', error);
        next(error);
    }
});

// POST /api/recipes (create new recipe)
router.post('/', async (req, res, next) => {
    try {
        console.log('📝 Received recipe creation request');
        console.log('Body keys:', Object.keys(req.body));
        console.log('Title:', req.body.title);

        const { title, prepTime, cookTime, servings, difficulty, category, description, externalLink, ingredients, steps, image, username } = req.body;

        // Validation
        if (!title || !prepTime || !cookTime || !servings || !category) {
            console.log('❌ Missing required fields');
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'Title, prepTime, cookTime, servings, and category are required'
            });
        }

        if (!Array.isArray(ingredients) || ingredients.length === 0) {
            console.log('❌ Invalid ingredients:', ingredients);
            return res.status(400).json({
                error: 'Invalid ingredients',
                message: 'At least one ingredient is required'
            });
        }

        if (!Array.isArray(steps) || steps.length === 0) {
            console.log('❌ Invalid steps:', steps);
            return res.status(400).json({
                error: 'Invalid steps',
                message: 'At least one step is required'
            });
        }

        // Validate optional external link if provided
        if (externalLink && typeof externalLink === 'string') {
            try {
                const u = new URL(externalLink);
                if (!(u.protocol === 'http:' || u.protocol === 'https:')) {
                    return res.status(400).json({
                        error: 'Invalid external link',
                        message: 'External link must start with http or https'
                    });
                }
            } catch {
                return res.status(400).json({
                    error: 'Invalid external link',
                    message: 'External link must be a valid URL'
                });
            }
        }

        // Prepare recipe data
        const recipeData = {
            title: title.trim(),
            prepTime: parseInt(prepTime),
            cookTime: parseInt(cookTime),
            servings: parseInt(servings),
            difficulty: difficulty || 'medium',
            category: category.trim(),
            description: description?.trim() || '',
            externalLink: externalLink?.trim() || '',
            ingredients: ingredients.filter(i => i && i.trim()),
            steps: steps.filter(s => s && s.trim()),
            image: image || null,
            username: username || 'anonymous'
        };

        console.log('✨ Creating recipe with data:', {
            title: recipeData.title,
            ingredientsCount: recipeData.ingredients.length,
            stepsCount: recipeData.steps.length
        });

        const newRecipe = await createRecipe(recipeData);

        console.log('✅ Recipe created successfully:', newRecipe.id);

        res.status(201).json({
            success: true,
            message: 'Recipe created successfully',
            recipe: newRecipe
        });

    } catch (error) {
        console.error('❌ Error creating recipe:', error);
        next(error);
    }
});

// GET /api/recipes/user/:username (get all recipes by user)
router.get('/user/:username', async (req, res, next) => {
    try {
        const { username } = req.params;
        console.log(`👤 Fetching recipes for user: ${username}`);
        const recipes = await getRecipesByUser(username);
        console.log(`✅ Found ${recipes.length} recipes for ${username}`);
        res.json({ success: true, recipes });
    } catch (error) {
        console.error('❌ Error fetching user recipes:', error);
        next(error);
    }
});

// GET /api/recipes/:id (get single recipe)
router.get('/:id', async (req, res, next) => {
    try {
        console.log(`🔍 Fetching recipe: ${req.params.id}`);
        const recipe = await getRecipeById(req.params.id);
        if (!recipe) {
            console.log('❌ Recipe not found');
            return res.status(404).json({
                error: 'Not found',
                message: 'Recipe not found'
            });
        }
        console.log('✅ Recipe found:', recipe.title);
        res.json({ success: true, recipe });
    } catch (error) {
        console.error('❌ Error fetching recipe:', error);
        next(error);
    }
});

// PUT /api/recipes/:id (update recipe)
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Get username from cookie
        const username = req.cookies?.username || req.body.username;

        console.log(`✏️ Updating recipe ${id} for user: ${username}`);

        if (!username) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'You must be logged in to update recipes'
            });
        }

        const updatedRecipe = await updateRecipe(id, updates, username);

        if (!updatedRecipe) {
            console.log('❌ Recipe not found or unauthorized');
            return res.status(404).json({
                error: 'Not found',
                message: 'Recipe not found or you do not have permission to update it'
            });
        }

        console.log('✅ Recipe updated successfully');
        res.json({
            success: true,
            message: 'Recipe updated successfully',
            recipe: updatedRecipe
        });
    } catch (error) {
        console.error('❌ Error updating recipe:', error);
        next(error);
    }
});

// DELETE /api/recipes/:id (delete recipe)
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        // Get username from cookie
        const username = req.cookies?.username;

        console.log(`🗑️ Delete request for recipe ${id} from user: ${username}`);

        if (!username) {
            console.log('❌ No username found in cookies');
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'You must be logged in to delete recipes'
            });
        }

        const deleted = await deleteRecipe(id, username);

        if (!deleted) {
            console.log('❌ Recipe not found or unauthorized');
            return res.status(404).json({
                error: 'Not found',
                message: 'Recipe not found or you do not have permission to delete it'
            });
        }

        console.log('✅ Recipe deleted successfully');
        res.json({
            success: true,
            message: 'Recipe deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting recipe:', error);
        next(error);
    }
});

export default router;