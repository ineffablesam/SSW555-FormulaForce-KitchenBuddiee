import { ObjectId } from 'mongodb';
import createHttpError from 'http-errors';
import { dbConnection } from '../config/mongoConnection.js';

const RECIPES_COLLECTION = 'recipes';

export async function createRecipe(recipeData) {
    const db = await dbConnection();
    const collection = db.collection(RECIPES_COLLECTION);

    console.log('📦 Inserting recipe:', recipeData.title);

    const result = await collection.insertOne({
        ...recipeData,
        createdAt: new Date(),
        updatedAt: new Date()
    });

    if (!result.acknowledged) {
        throw createHttpError(500, 'Failed to insert recipe');
    }

    console.log('✅ Recipe inserted with ID:', result.insertedId);

    return {
        id: result.insertedId,
        ...recipeData
    };
}

// NEW: Get all recipes
export async function getAllRecipes() {
    const db = await dbConnection();
    const collection = db.collection(RECIPES_COLLECTION);
    return await collection.find({}).sort({ createdAt: -1 }).toArray();
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

    const result = await collection.findOneAndUpdate(
        filter,
        { $set: { ...updates, updatedAt: new Date() } },
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