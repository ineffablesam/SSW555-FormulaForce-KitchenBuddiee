import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createCategory, getCategoryByName, deleteCategory } from '../data/categories.js';

describe('Category CRUD tests', () => {
  const testCategory = {
    name: 'TestCategory',
    description: 'This is a test category',
    username: 'testuser'
  };
  let createdCategoryId;

  beforeAll(async () => {
    // Cleanup if test category already exists
    const existing = await getCategoryByName(testCategory.username, testCategory.name);
    if (existing) {
      await deleteCategory(existing._id, testCategory.username);
    }
  });

  afterAll(async () => {
    // Clean up after tests
    if (createdCategoryId) {
      await deleteCategory(createdCategoryId, testCategory.username);
    }
  });

  it('should create a category successfully', async () => {
    const category = await createCategory(testCategory);
    createdCategoryId = category.id;
    expect(category.name).toBe(testCategory.name);
    expect(category.username).toBe(testCategory.username);
  });

  it('should not allow duplicate category names', async () => {
    let error;
    try {
      await createCategory(testCategory);
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
  });

  it('should reject category names too short or too long', async () => {
    let shortError, longError;
    try {
      await createCategory({ ...testCategory, name: 'ab' });
    } catch (err) {
      shortError = err;
    }
    try {
      await createCategory({ ...testCategory, name: 'a'.repeat(26) });
    } catch (err) {
      longError = err;
    }
    expect(shortError).toBeDefined();
    expect(longError).toBeDefined();
  });
});
