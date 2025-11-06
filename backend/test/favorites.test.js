import { getFavoritesByUsername, upsertFavorites, deleteFavorites } from '../data/favorites.js';
import { favorites } from '../config/mongoCollections.js';

describe('Favorites Data Layer', () => {
  const testUser = 'testuser_favorites';
  const testRecipes = ['recipe1', 'recipe2', 'recipe3'];

  beforeAll(async () => {
    // Clean up before tests
    const col = await favorites();
    await col.deleteMany({ username: testUser });
  });

  afterAll(async () => {
    // Clean up after tests
    const col = await favorites();
    await col.deleteMany({ username: testUser });
  });

  test('getFavoritesByUsername returns empty array for new user', async () => {
    const result = await getFavoritesByUsername(testUser);
    expect(result).toEqual({
      username: testUser,
      favorites: []
    });
  });

  test('upsertFavorites creates new favorites list', async () => {
    const result = await upsertFavorites(testUser, testRecipes);
    expect(result.success).toBe(true);

    const saved = await getFavoritesByUsername(testUser);
    expect(saved.username).toBe(testUser);
    expect(saved.favorites).toEqual(testRecipes);
  });

  test('upsertFavorites updates existing favorites', async () => {
    const newFavorites = ['recipe4', 'recipe5'];
    const result = await upsertFavorites(testUser, newFavorites);
    expect(result.success).toBe(true);

    const saved = await getFavoritesByUsername(testUser);
    expect(saved.favorites).toEqual(newFavorites);
  });

  test('deleteFavorites removes favorites list', async () => {
    const result = await deleteFavorites(testUser);
    expect(result.deleted).toBe(true);

    const saved = await getFavoritesByUsername(testUser);
    expect(saved.favorites).toEqual([]);
  });

  test('getFavoritesByUsername validates username', async () => {
    await expect(getFavoritesByUsername()).rejects.toThrow('username is required');
    await expect(getFavoritesByUsername(123)).rejects.toThrow('username must be a string');
  });

  test('upsertFavorites validates input', async () => {
    await expect(upsertFavorites(testUser, 'not-an-array')).rejects.toThrow('favorites must be an array');
    await expect(upsertFavorites(testUser, [123])).rejects.toThrow('each favorite must be a string');
  });
});

describe('Favorites API Endpoints', () => {
  const testUser = 'testuser_favorites_api';
  const testRecipes = ['recipe1', 'recipe2'];
  let app;
  let request;

  beforeAll(async () => {
    // Clean up before tests
    const col = await favorites();
    await col.deleteMany({ username: testUser });
  });

  beforeEach(() => {
    // Mock Express app and request for API tests
    app = {
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };
    request = {
      params: { username: testUser },
      body: { favorites: testRecipes },
    };
  });

  afterAll(async () => {
    // Clean up after tests
    const col = await favorites();
    await col.deleteMany({ username: testUser });
  });

  test('GET /api/favorites/:username returns favorites', async () => {
    const response = {};
    response.json = jest.fn();
    response.status = jest.fn().mockReturnValue(response);

    await app.get('/api/favorites/:username', async (req, res) => {
      const result = await getFavoritesByUsername(req.params.username);
      res.json(result);
    })(request, response);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        username: testUser,
        favorites: expect.any(Array),
      })
    );
  });

  test('PUT /api/favorites/:username updates favorites', async () => {
    const response = {};
    response.json = jest.fn();
    response.status = jest.fn().mockReturnValue(response);

    await app.put('/api/favorites/:username', async (req, res) => {
      const result = await upsertFavorites(req.params.username, req.body.favorites);
      res.json(result);
    })(request, response);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
      })
    );
  });

  test('DELETE /api/favorites/:username removes favorites', async () => {
    const response = {};
    response.json = jest.fn();
    response.status = jest.fn().mockReturnValue(response);

    await app.delete('/api/favorites/:username', async (req, res) => {
      const result = await deleteFavorites(req.params.username);
      res.json(result);
    })(request, response);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        deleted: true,
      })
    );
  });
});