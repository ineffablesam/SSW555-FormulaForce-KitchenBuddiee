import { getCartByUsername, upsertCart, deleteCart, removeCartItem, removeRecipeIngredients } from '../data/shoppingCart.js';
import { cart } from '../config/mongoCollections.js';

describe('Shopping Cart Data Layer', () => {
  const testUser = 'testuser_cart';
  const testItems = [
    { text: 'Eggs', qty: 2, checked: false },
    { text: 'Milk', qty: 1, checked: true },
  ];

  beforeAll(async () => {
    // Clean up before tests
    const col = await cart();
    await col.deleteMany({ username: testUser });
  });

  afterAll(async () => {
    // Clean up after tests
    const col = await cart();
    await col.deleteMany({ username: testUser });
  });

  test('upsertCart creates a new cart', async () => {
    const result = await upsertCart(testUser, testItems);
    expect(result.success).toBe(true);
    const cartData = await getCartByUsername(testUser);
    expect(cartData.username).toBe(testUser);
    expect(cartData.items.length).toBe(2);
    expect(cartData.items[0].text).toBe('Eggs');
  });

  test('getCartByUsername returns correct items', async () => {
    const cartData = await getCartByUsername(testUser);
    expect(cartData.items).toEqual(expect.arrayContaining([
      expect.objectContaining({ text: 'Eggs', qty: 2 }),
      expect.objectContaining({ text: 'Milk', checked: true })
    ]));
  });

  test('deleteCart removes the cart', async () => {
    const delResult = await deleteCart(testUser);
    expect(delResult.deleted).toBe(true);
    const cartData = await getCartByUsername(testUser);
    expect(cartData.items).toEqual([]);
  });

  test('removeCartItem removes a single ingredient', async () => {
    // Seed cart again
    await upsertCart(testUser, [
      { text: 'Flour', qty: 1 },
      { text: 'Sugar', qty: 1 },
      { text: 'Butter', qty: 2 }
    ]);
    const before = await getCartByUsername(testUser);
    expect(before.items.length).toBe(3);
    const result = await removeCartItem(testUser, 'Sugar');
    expect(result.removed).toBe(true);
    expect(result.items.find(i => i.text === 'Sugar')).toBeUndefined();
    const after = await getCartByUsername(testUser);
    expect(after.items.length).toBe(2);
  });

  test('removeCartItem no-op when item not present', async () => {
    const result = await removeCartItem(testUser, 'Nonexistent Ingredient');
    expect(result.removed).toBe(false);
  });

  test('upsertCart throws on invalid items', async () => {
    await expect(upsertCart(testUser, 'not-an-array')).rejects.toThrow('items must be an array');
    await expect(upsertCart(testUser, [{ text: 123 }])).rejects.toThrow('item.text must be a string');
  });

  test('getCartByUsername throws on missing username', async () => {
    await expect(getCartByUsername()).rejects.toThrow('username is required');
  });

  test('removeRecipeIngredients decrements quantities and removes depleted items', async () => {
    // Seed cart with aggregated items
    await upsertCart(testUser, [
      { text: 'Eggs', qty: 3 },
      { text: 'Butter', qty: 2 },
      { text: 'Salt', qty: 1 }
    ]);
    const recipe = { ingredients: ['Eggs', 'Butter', 'Eggs'] }; // Eggs twice, Butter once
    const result = await removeRecipeIngredients(testUser, recipe);
    expect(result.removed).toBe(true);
    // Eggs qty should drop from 3 to 1
    const eggsItem = result.items.find(i => i.text === 'Eggs');
    expect(eggsItem.qty).toBe(1);
    // Butter qty 2 -> 1
    const butterItem = result.items.find(i => i.text === 'Butter');
    expect(butterItem.qty).toBe(1);
    // Salt untouched
    const saltItem = result.items.find(i => i.text === 'Salt');
    expect(saltItem.qty).toBe(1);
    // removedTexts should not include remaining items
    expect(result.removedTexts).toEqual([]); // none fully removed
    // Now remove remaining Butter and Eggs completely
    const recipe2 = { ingredients: ['Eggs', 'Butter', 'Eggs', 'Butter'] }; // attempt over-removal
    const result2 = await removeRecipeIngredients(testUser, recipe2);
    // Eggs qty 1 - 2 => removed, Butter qty 1 - 2 => removed
    expect(result2.items.find(i => i.text === 'Eggs')).toBeUndefined();
    expect(result2.items.find(i => i.text === 'Butter')).toBeUndefined();
    expect(result2.items.find(i => i.text === 'Salt')).toBeDefined();
    expect(result2.removedTexts).toEqual(expect.arrayContaining(['Eggs', 'Butter']));
  });
});
