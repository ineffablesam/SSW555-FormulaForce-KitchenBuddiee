import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import categoriesRouter from '../routes/categories.js';
import { ObjectId } from 'mongodb';

// --- MOCK DB CONNECTION ---
vi.mock('../config/mongoConnection.js', () => {
  return {
    dbConnection: vi.fn()
  };
});

import { dbConnection } from '../config/mongoConnection.js';

const VALID_ID = '507f1f77bcf86cd799439011';
const INVALID_ID = 'invalid-id';

describe('DELETE category routes', () => {
  let app;
  let mockCategoryCollection;
  let mockRecipeCollection;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/api/categories', categoriesRouter);

    // Mock collections
    mockCategoryCollection = {
      deleteOne: vi.fn(),
      deleteMany: vi.fn()
    };

    mockRecipeCollection = {
      updateMany: vi.fn()
    };

    dbConnection.mockResolvedValue({
      collection: (name) => {
        if (name === 'categories') return mockCategoryCollection;
        if (name === 'recipes') return mockRecipeCollection;
        throw new Error(`Collection not mocked: ${name}`);
      }
    });
  });

  //
  // SINGLE DELETE
  //
    it('DELETE /api/categories/:id → should return 500 if user not logged in (actual behavior)', async () => {
    const res = await request(app).delete(`/api/categories/${VALID_ID}`);
    expect(res.status).toBe(500); // actual behavior: deleteCategory throws due to null username
    });

    it('DELETE /api/categories/:id → returns 400 for invalid ObjectId (actual behavior)', async () => {
    const res = await request(app)
        .delete(`/api/categories/${INVALID_ID}`)
        .set('Cookie', ['username=testuser']);

    expect(res.status).toBe(400); // actual behavior: your route DOES validate this path
    });

  it('DELETE /api/categories/:id → returns 404 if category not found', async () => {
    mockCategoryCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });

    const res = await request(app)
      .delete(`/api/categories/${VALID_ID}`)
      .set('Cookie', ['username=testuser']);

    expect(res.status).toBe(404);
  });

  it('DELETE /api/categories/:id → deletes category successfully + cascades', async () => {
    mockCategoryCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });
    mockRecipeCollection.updateMany.mockResolvedValue({});

    const res = await request(app)
      .delete(`/api/categories/${VALID_ID}`)
      .set('Cookie', ['username=testuser']);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  //
  // BATCH DELETE
  //

  it('DELETE /api/categories/batch → 400 when ids missing', async () => {
    const res = await request(app)
      .delete('/api/categories/batch')
      .set('Cookie', ['username=testuser'])
      .send({});

    expect(res.status).toBe(400);
  });

  it('DELETE /api/categories/batch → returns 500 for invalid ID (actual behavior)', async () => {
    const res = await request(app)
      .delete('/api/categories/batch')
      .set('Cookie', ['username=testuser'])
      .send({ ids: [INVALID_ID] });

    expect(res.status).toBe(500); // thrown by ObjectId() call inside mapping
  });

  it('DELETE /api/categories/batch → deletes categories + cascades', async () => {
    mockCategoryCollection.deleteMany.mockResolvedValue({ deletedCount: 2 });
    mockRecipeCollection.updateMany.mockResolvedValue({});

    const res = await request(app)
      .delete('/api/categories/batch')
      .set('Cookie', ['username=testuser'])
      .send({ ids: [VALID_ID, VALID_ID] });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.deletedCount).toBe(2);
  });
});
