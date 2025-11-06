import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createCategory, getCategoryByName, deleteCategory, updateCategory } from '../data/categories.js';

describe('Category update tests', () => {
  const testCategory = {
    name: 'UpdateTest',
    description: 'Category to test updates',
    username: 'testuser',
    color: '#FF0000'
  };
  let createdCategoryId;

  beforeAll(async () => {
    const existing = await getCategoryByName(testCategory.username, testCategory.name);
    if (existing) {
      await deleteCategory(existing._id, testCategory.username);
    }
    const created = await createCategory(testCategory);
    createdCategoryId = created.id;
  });

  afterAll(async () => {
    if (createdCategoryId) {
      await deleteCategory(createdCategoryId, testCategory.username);
    }
  });

  it('should update category name and color successfully', async () => {
    const updates = { name: 'UpdatedName', color: '#00FF00' };
    const result = await updateCategory(createdCategoryId, updates, testCategory.username);
    expect(result).toBeDefined();
    expect(result).toBeDefined();   // check value exists
    expect(result.name).toBe(updates.name);
    expect(result.color).toBe(updates.color);
  });

  it('should not allow updating to a duplicate name', async () => {
    const other = await createCategory({ name: 'DuplicateName', username: testCategory.username });
    let error;
    try {
      await updateCategory(createdCategoryId, { name: 'DuplicateName' }, testCategory.username);
    } catch (err) {
      error = err;
    } finally {
      await deleteCategory(other.id, testCategory.username);
    }
    expect(error).toBeDefined();
    expect(error.message).toMatch(/already exists/i);
  });

  it('should reject name updates less than 3 or greater than 25 characters', async () => {
    let shortError, longError;
    try {
      await updateCategory(createdCategoryId, { name: 'ab' }, testCategory.username);
    } catch (err) {
      shortError = err;
    }
    try {
      await updateCategory(createdCategoryId, { name: 'a'.repeat(26) }, testCategory.username);
    } catch (err) {
      longError = err;
    }
    expect(shortError).toBeDefined();
    expect(shortError.message).toMatch(/between 3 and 25/i);
    expect(longError).toBeDefined();
    expect(longError.message).toMatch(/between 3 and 25/i);
  });
});
