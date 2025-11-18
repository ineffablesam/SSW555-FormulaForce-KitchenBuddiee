import { ObjectId } from 'mongodb';
import createHttpError from 'http-errors';
import { dbConnection } from '../config/mongoConnection.js';

const CATEGORIES_COLLECTION = 'categories';

export async function createCategory(categoryData) {
    const { name, description, username, color } = categoryData;
    if (!name || typeof name !== 'string') {
        throw createHttpError(400, 'Category name is required.');
    }

    // Trim and validate length
    const trimmedName = name.trim();
    if (trimmedName.length < 3 || trimmedName.length > 25) {
        throw createHttpError(400, 'Category name must be between 3 and 25 characters.');
    }

    const db = await dbConnection();
    const collection = db.collection(CATEGORIES_COLLECTION);

    // Check for duplicate name for this user
    const existing = await collection.findOne({ username, name: trimmedName });
    if (existing) {
        throw createHttpError(400, 'Category name already exists for this user.');
    }
    
    const result = await collection.insertOne({
        ...categoryData,
        recipes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    if (!result.acknowledged) {
        throw createHttpError(500, 'Failed to create category');
    }

    return {
        id: result.insertedId,
        ...categoryData,
    };
}

export async function getAllCategories(username) {
  const db = await dbConnection();
  const collection = db.collection(CATEGORIES_COLLECTION);
  // Only return categories belonging to the user
  return await collection.find({ username }).sort({ createdAt: -1 }).toArray();
}

export async function getCategoryById(id, username) {
  const db = await dbConnection();
  const collection = db.collection(CATEGORIES_COLLECTION);
  let objectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    throw createHttpError(400, 'Invalid category ID format');
  }
  return await collection.findOne({ _id: objectId, username });
}

export async function getCategoryByName(username, name) {
  const db = await dbConnection();
  const collection = db.collection(CATEGORIES_COLLECTION);
  return await collection.findOne({ username, name });
}

export async function updateCategory(id, updates, username) {
  const { name } = updates;

  if (name && (name.length < 3 || name.length > 25)) {
    throw createHttpError(400, 'Category name must be between 3 and 25 characters.');
  }
  
  const db = await dbConnection();
  const collection = db.collection(CATEGORIES_COLLECTION);

  let objectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    throw createHttpError(400, 'Invalid category ID format');
  }
  
  // Check for duplicate name if name is being updated
  if (updates.name) {
    const existing = await collection.findOne({ 
      username, 
      name: updates.name, 
      _id: { $ne: objectId } // exclude current category
    });
    if (existing) {
      throw createHttpError(400, 'Category name already exists for this user.');
    }
  }
  const result = await collection.findOneAndUpdate(
    { _id: objectId, username },
    { $set: { ...updates, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );


  if (!result) {
    throw createHttpError(400, 'Failed to update category — maybe wrong ID or duplicate name');
  }

  return result;
}

export async function deleteCategory(id, username) {
  const db = await dbConnection();
  const collection = db.collection(CATEGORIES_COLLECTION);

  let objectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    throw createHttpError(400, 'Invalid category ID format');
  }

  const result = await collection.deleteOne({ _id: objectId, username });
  return result.deletedCount > 0;
}
