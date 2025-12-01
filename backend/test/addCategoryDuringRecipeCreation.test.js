import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import { ObjectId } from 'mongodb';

import recipesRouter from '../routes/recipes.js';

// ---- MOCK createRecipe() so recipe creation does not hit DB ----
vi.mock('../data/recipes.js', () => {
  return {
    createRecipe: vi.fn(),
  };
});
import { createRecipe } from '../data/recipes.js';

describe('POST /api/recipes → category field handling', () => {
  let app;

  const BASE_RECIPE = {
    title: "Test Recipe",
    prepTime: 10,
    cookTime: 20,
    servings: 2,
    difficulty: "easy",
    description: "Test recipe",
    externalLink: "",
    ingredients: ["ingredient 1"],
    steps: ["step 1"],
    username: "testuser",
    isPrivate: false
  };

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/api/recipes', recipesRouter);

    // reset mocked function each test
    createRecipe.mockReset();
  });

  // ---------------------------------------------------------------------
  it("should create a recipe with one category", async () => {
    const category = [
      { id: new ObjectId().toString(), name: "Breakfast" }
    ];

    // make createRecipe return a fake recipe object
    createRecipe.mockResolvedValue({
      id: new ObjectId().toString(),
      title: BASE_RECIPE.title,
      category
    });

    const res = await request(app)
      .post("/api/recipes")
      .send({ ...BASE_RECIPE, category });

    expect(res.status).toBe(201);

    // check createRecipe was called with correct category
    const calledWith = createRecipe.mock.calls[0][0];
    expect(calledWith.category).toEqual(category);
  });

  // ---------------------------------------------------------------------
  it("should create a recipe with multiple categories", async () => {
    const categories = [
      { id: new ObjectId().toString(), name: "Dinner" },
      { id: new ObjectId().toString(), name: "Italian" }
    ];

    createRecipe.mockResolvedValue({
      id: new ObjectId().toString(),
      title: BASE_RECIPE.title,
      category: categories
    });

    const res = await request(app)
      .post("/api/recipes")
      .send({ ...BASE_RECIPE, category: categories });

    expect(res.status).toBe(201);

    const calledWith = createRecipe.mock.calls[0][0];
    expect(calledWith.category).toEqual(categories);
  });

});
