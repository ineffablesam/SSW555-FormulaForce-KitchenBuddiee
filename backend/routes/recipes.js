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
        const recipes = await getRecipesByUser(username);
        res.json({ success: true, recipes });
    } catch (error) {
        next(error);
    }
});

// GET /api/recipes/:id (get single recipe)
router.get('/:id', async (req, res, next) => {
    try {
        const recipe = await getRecipeById(req.params.id);
        if (!recipe) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Recipe not found'
            });
        }
        res.json({ success: true, recipe });
    } catch (error) {
        next(error);
    }
});

// PUT /api/recipes/:id (update recipe)
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const username = req.user?.username;

        const updatedRecipe = await updateRecipe(id, updates, username);

        if (!updatedRecipe) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Recipe not found or unauthorized'
            });
        }

        res.json({
            success: true,
            message: 'Recipe updated successfully',
            recipe: updatedRecipe
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/recipes/:id (delete recipe)
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const username = req.user?.username;

        const deleted = await deleteRecipe(id, username);

        if (!deleted) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Recipe not found or unauthorized'
            });
        }

        res.json({
            success: true,
            message: 'Recipe deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

export default router;
