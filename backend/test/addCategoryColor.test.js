import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createCategory, getCategoryByName, deleteCategory } from '../data/categories.js';

describe('Category Color Validation Tests', () => {
  const baseCategory = {
    name: 'ColorTestCategory',
    description: 'Testing category colors',
    username: 'testuser'
  };

  let createdCategoryId;

  beforeAll(async () => {
    // Cleanup if category exists before test
    const existing = await getCategoryByName(baseCategory.username, baseCategory.name);
    if (existing) {
      await deleteCategory(existing._id, baseCategory.username);
    }
  });

  afterAll(async () => {
    // Cleanup after tests
    if (createdCategoryId) {
      await deleteCategory(createdCategoryId, baseCategory.username);
    }
  });

  it('should default color to #FFFFFF when no color is provided', async () => {
    const category = await createCategory(baseCategory);
    createdCategoryId = category.id;

    expect(category.color).toBe('#FFFFFF');
  });

  it('should accept a valid short hex color (#ABC)', async () => {
    const result = await createCategory({
      ...baseCategory,
      name: 'ColorHexShort',
      color: '#ABC'
    });

    await deleteCategory(result.id, result.username);

    expect(result.color).toBe('#ABC');
  });

  it('should accept a valid long hex color and normalize to uppercase', async () => {
    const result = await createCategory({
      ...baseCategory,
      name: 'ColorHexLong',
      color: '#aabbcc'
    });

    await deleteCategory(result.id, result.username);

    expect(result.color).toBe('#AABBCC');
  });

  it('should reject invalid hex colors', async () => {
    const invalidColors = ['blue', '#ZZZ', '#12345', '#1234567', '123456', '#12'];

    for (const color of invalidColors) {
      let error;

      try {
        await createCategory({
          ...baseCategory,
          name: `InvalidColor-${color}`,
          color
        });
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.message).toContain('Invalid color format');
    }
  });
});
