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

describe('Recipe Tags API', () => {
    let app;
    let mockRecipeCollection;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use(cookieParser());
        app.use('/api/recipes', recipesRouter);

        // Mock collection
        mockRecipeCollection = {
            insertOne: vi.fn(),
            findOneAndUpdate: vi.fn(),
            findOne: vi.fn(),
            find: vi.fn().mockReturnThis(),
            sort: vi.fn().mockReturnThis(),
            toArray: vi.fn()
        };

        // Mock dbConnection
        dbConnection.mockResolvedValue({
            collection: (name) => {
                if (name === 'recipes') return mockRecipeCollection;
                throw new Error(`Collection not mocked: ${name}`);
            }
        });
    });

    describe('POST /api/recipes', () => {
        it('should create a recipe with tags', async () => {
            const newRecipe = {
                title: 'Test Recipe',
                prepTime: 10,
                cookTime: 20,
                servings: 4,
                ingredients: ['ing1'],
                steps: ['step1'],
                tags: ['vegan', 'quick']
            };

            mockRecipeCollection.insertOne.mockResolvedValue({
                acknowledged: true,
                insertedId: new ObjectId(VALID_RECIPE_ID)
            });

            const res = await request(app)
                .post('/api/recipes')
                .send(newRecipe);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.recipe.tags).toEqual(['vegan', 'quick']);

            // Verify db call
            expect(mockRecipeCollection.insertOne).toHaveBeenCalledWith(expect.objectContaining({
                tags: ['vegan', 'quick']
            }));
        });

        it('should default tags to empty array if not provided', async () => {
            const newRecipe = {
                title: 'Test Recipe No Tags',
                prepTime: 10,
                cookTime: 20,
                servings: 4,
                ingredients: ['ing1'],
                steps: ['step1']
            };

            mockRecipeCollection.insertOne.mockResolvedValue({
                acknowledged: true,
                insertedId: new ObjectId(VALID_RECIPE_ID)
            });

            const res = await request(app)
                .post('/api/recipes')
                .send(newRecipe);

            expect(res.status).toBe(201);
            expect(res.body.recipe.tags).toEqual([]);
        });
    });

    describe('PUT /api/recipes/:id', () => {
        it('should update recipe tags', async () => {
            const updates = {
                tags: ['updated', 'tags']
            };

            mockRecipeCollection.findOneAndUpdate.mockResolvedValue({
                _id: new ObjectId(VALID_RECIPE_ID),
                title: 'Test Recipe',
                tags: ['updated', 'tags']
            });

            const res = await request(app)
                .put(`/api/recipes/${VALID_RECIPE_ID}`)
                .set('Cookie', ['username=testuser'])
                .send(updates);

            expect(res.status).toBe(200);
            expect(res.body.recipe.tags).toEqual(['updated', 'tags']);

            // Verify db call
            expect(mockRecipeCollection.findOneAndUpdate).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    $set: expect.objectContaining({
                        tags: ['updated', 'tags']
                    })
                }),
                expect.anything()
            );
        });

        it('should return 400 if tags is not an array', async () => {
            const updates = {
                tags: 'not-an-array'
            };

            const res = await request(app)
                .put(`/api/recipes/${VALID_RECIPE_ID}`)
                .set('Cookie', ['username=testuser'])
                .send(updates);

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Invalid tags');
        });
    });
});
