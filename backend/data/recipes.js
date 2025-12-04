import { ObjectId } from 'mongodb';
import createHttpError from 'http-errors';
import { dbConnection } from '../config/mongoConnection.js';

const RECIPES_COLLECTION = 'recipes';
const escapeRegex = (text = '') => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Normalize tags: trim, drop empties, lowercase for dedupe but keep original casing consistent
const sanitizeTags = (tags = []) => {
    if (!Array.isArray(tags)) return [];
    const seen = new Set();
    const cleaned = [];

    for (const raw of tags) {
        if (typeof raw !== 'string') continue;
        const trimmed = raw.trim();
        if (!trimmed) continue;
        const key = trimmed.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        cleaned.push(trimmed);
    }

    return cleaned;
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

    return await collection.find(query).sort({ createdAt: -1 }).toArray();
}
export async function getRecipesByUser(username) {
    const db = await dbConnection();
    const collection = db.collection(RECIPES_COLLECTION);
    return await collection.find({ username }).sort({ createdAt: -1 }).toArray();
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
    return await collection.findOne({ _id: objectId });
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

    const result = await collection.updateMany(
        {
            username,
            tags: { $regex: regex }
        },
        {
            $pull: { tags: { $regex: regex } },
            $set: { updatedAt: new Date() }
        }
    );

    return {
        modifiedCount: result.modifiedCount || 0
    };
}
