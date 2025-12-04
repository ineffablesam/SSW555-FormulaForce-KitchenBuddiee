import { ObjectId } from 'mongodb';
import createHttpError from 'http-errors';
import { dbConnection } from '../config/mongoConnection.js';

const RECIPES_COLLECTION = 'recipes';
const DEFAULT_TAG_COLOR = '#f97316';
const escapeRegex = (text = '') => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isValidHexColor = (value = '') => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
const normalizeTag = (tag) => {
    if (typeof tag === 'string') {
        const name = tag.trim();
        if (!name) return null;
        return { name, color: DEFAULT_TAG_COLOR };
    }

    if (tag && typeof tag === 'object') {
        const name = (tag.name || tag.label || '').trim();
        if (!name) return null;
        const color = isValidHexColor(tag.color) ? tag.color : DEFAULT_TAG_COLOR;
        return { name, color };
    }

    return null;
};

// Normalize tags: trim, drop empties, lowercase for dedupe but keep original casing consistent
const sanitizeTags = (tags = []) => {
    if (!Array.isArray(tags)) return [];
    const tagMap = new Map();

    for (const raw of tags) {
        const normalized = normalizeTag(raw);
        if (!normalized) continue;
        tagMap.set(normalized.name.toLowerCase(), normalized);
    }

    return Array.from(tagMap.values());
};

export async function createRecipe(recipeData) {
    const db = await dbConnection();
    const collection = db.collection(RECIPES_COLLECTION);

    const tags = sanitizeTags(recipeData.tags);

    console.log('📦 Inserting recipe:', recipeData.title);

    const result = await collection.insertOne({
        ...recipeData,
        tags,
        isPrivate: !!recipeData.isPrivate,
        createdAt: new Date(),
        updatedAt: new Date()
    });

    if (!result.acknowledged) {
        throw createHttpError(500, 'Failed to insert recipe');
    }

    console.log('✅ Recipe inserted with ID:', result.insertedId);

    return {
        id: result.insertedId,
        ...recipeData,
        tags,
        isPrivate: !!recipeData.isPrivate
    };
}

// NEW: Get all recipes
export async function getAllRecipes(filter = {}, requestingUser = null) {
    const db = await dbConnection();
    const collection = db.collection(RECIPES_COLLECTION);
    const query = {};
    const andConditions = [];

    if (filter.username) query.username = filter.username;
    if (filter.category) query.category = filter.category;

    if (Array.isArray(filter.ingredients) && filter.ingredients.length) {
        const ingredientAnds = filter.ingredients.map(term => ({
            ingredients: {
                $elemMatch: {
                    $regex: new RegExp(escapeRegex(term), 'i')
                }
            }
        }));
        andConditions.push(...ingredientAnds);
    }

    // Privacy filter - this should be added to the $and conditions
    if (requestingUser) {
        andConditions.push({
            $or: [
                { isPrivate: { $ne: true } },           // Public recipes
                {
                    isPrivate: true,
                    username: requestingUser            // Private recipes owned by user
                }
            ]
        });
    } else {
        andConditions.push({ isPrivate: { $ne: true } });  // Only public recipes
    }

    if (andConditions.length) {
        query.$and = andConditions;
    }

    const recipes = await collection.find(query).sort({ createdAt: -1 }).toArray();
    return recipes.map(recipe => ({
        ...recipe,
        tags: sanitizeTags(recipe.tags)
    }));
}
export async function getRecipesByUser(username) {
    const db = await dbConnection();
    const collection = db.collection(RECIPES_COLLECTION);
    const recipes = await collection.find({ username }).sort({ createdAt: -1 }).toArray();
    return recipes.map(recipe => ({
        ...recipe,
        tags: sanitizeTags(recipe.tags)
    }));
}

export async function getRecipeById(id) {
    const db = await dbConnection();
    const collection = db.collection(RECIPES_COLLECTION);
    let objectId;
    try {
        objectId = new ObjectId(id);
    } catch {
        throw createHttpError(400, 'Invalid recipe ID format');
    }
    const recipe = await collection.findOne({ _id: objectId });
    if (recipe) {
        recipe.tags = sanitizeTags(recipe.tags);
    }
    return recipe;
}

export async function updateRecipe(id, updates, username) {
    const db = await dbConnection();
    const collection = db.collection(RECIPES_COLLECTION);

    let objectId;
    try {
        objectId = new ObjectId(id);
    } catch {
        throw createHttpError(400, 'Invalid recipe ID format');
    }

    const filter = { _id: objectId };
    if (username) filter.username = username;

    const sanitizedUpdates = { ...updates };
    if (updates.tags) {
        sanitizedUpdates.tags = sanitizeTags(updates.tags);
    }

    const result = await collection.findOneAndUpdate(
        filter,
        { $set: { ...sanitizedUpdates, updatedAt: new Date() } },
        { returnDocument: 'after' }
    );

    return result;
}

export async function deleteRecipe(id, username) {
    const db = await dbConnection();
    const collection = db.collection(RECIPES_COLLECTION);

    let objectId;
    try {
        objectId = new ObjectId(id);
    } catch {
        throw createHttpError(400, 'Invalid recipe ID format');
    }

    const filter = { _id: objectId };
    if (username) filter.username = username;

    const result = await collection.deleteOne(filter);
    return result.deletedCount > 0;
}

export async function removeTagFromUserRecipes(username, tagName) {
    if (!username) {
        throw createHttpError(401, 'You must be logged in to modify tags');
    }

    if (!tagName || typeof tagName !== 'string' || !tagName.trim()) {
        throw createHttpError(400, 'Tag name is required');
    }

    const normalizedTag = tagName.trim();
    const db = await dbConnection();
    const collection = db.collection(RECIPES_COLLECTION);
    const regex = new RegExp(`^${escapeRegex(normalizedTag)}$`, 'i');

    const filter = {
        username,
        tags: {
            $elemMatch: {
                $or: [
                    { $regex: regex },
                    { name: { $regex: regex } }
                ]
            }
        }
    };

    const result = await collection.updateMany(
        filter,
        {
            $pull: {
                tags: {
                    $or: [
                        { $regex: regex },
                        { name: { $regex: regex } }
                    ]
                }
            },
            $set: { updatedAt: new Date() }
        }
    );

    return {
        modifiedCount: result.modifiedCount || 0
    };
}
