import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import recipesRouter from '../routes/recipes.js';
import { ObjectId } from 'mongodb';

// --- MOCK DB CONNECTION ---
vi.mock('../config/mongoConnection.js', () => {
  return {
    dbConnection: vi.fn()
  };
});

import { dbConnection } from '../config/mongoConnection.js';

const VALID_RECIPE_ID = '507f1f77bcf86cd799439011';
const VALID_CATEGORY_ID = '507f1f77bcf86cd799439012';

describe('PATCH /api/recipes/:id/category', () => {
  let app;
  let mockCategoryCollection;
  let mockRecipeCollection;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/api/recipes', recipesRouter);

    // Mock collections
    mockCategoryCollection = {
      find: vi.fn().mockReturnThis(),
      project: vi.fn().mockReturnThis(),
      toArray: vi.fn(),
      updateMany: vi.fn()
    };

    mockRecipeCollection = {
      findOneAndUpdate: vi.fn()
    };

    // Mock dbConnection
    dbConnection.mockResolvedValue({
      collection: (name) => {
        if (name === 'categories') return mockCategoryCollection;
        if (name === 'recipes') return mockRecipeCollection;
        throw new Error(`Collection not mocked: ${name}`);
      }
    });
  });

  // ----------------------------------------------------------
  it('should return 401 if user is not logged in', async () => {
    const res = await request(app)
      .patch(`/api/recipes/${VALID_RECIPE_ID}/category`)
      .send({ category: [{ id: VALID_CATEGORY_ID }] });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  // ----------------------------------------------------------
  it('should return 400 if category is missing', async () => {
    const res = await request(app)
      .patch(`/api/recipes/${VALID_RECIPE_ID}/category`)
      .set('Cookie', ['username=testuser'])
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Missing categories');
  });

  // ----------------------------------------------------------
  it('should return 400 for invalid category ID format', async () => {
    const res = await request(app)
      .patch(`/api/recipes/${VALID_RECIPE_ID}/category`)
      .set('Cookie', ['username=testuser'])
      .send({ category: [{ id: 'invalid-id' }] });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid category ID format');
  });

  // ----------------------------------------------------------
  it('should return 404 if categories do not exist', async () => {
    mockCategoryCollection.toArray.mockResolvedValue([]); // simulate not found

    const res = await request(app)
      .patch(`/api/recipes/${VALID_RECIPE_ID}/category`)
      .set('Cookie', ['username=testuser'])
      .send({ category: [{ id: VALID_CATEGORY_ID }] });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not found');
  });

  // ----------------------------------------------------------
  it('should update recipe categories successfully', async () => {
    const mockCategory = { _id: new ObjectId(VALID_CATEGORY_ID), name: 'Desserts' };
    const mockUpdatedRecipe = { _id: new ObjectId(VALID_RECIPE_ID), title: 'Chocolate Cake' };

    mockCategoryCollection.toArray.mockResolvedValue([mockCategory]);
    mockRecipeCollection.findOneAndUpdate.mockResolvedValue(mockUpdatedRecipe);

    const res = await request(app)
      .patch(`/api/recipes/${VALID_RECIPE_ID}/category`)
      .set('Cookie', ['username=testuser'])
      .send({ category: [{ id: VALID_CATEGORY_ID }] });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.recipe.title).toBe('Chocolate Cake');
  });
});
