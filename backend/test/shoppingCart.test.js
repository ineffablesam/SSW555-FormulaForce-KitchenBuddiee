import { getCartByUsername, upsertCart, deleteCart } from '../data/shoppingCart.js';
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

  test('upsertCart throws on invalid items', async () => {
    await expect(upsertCart(testUser, 'not-an-array')).rejects.toThrow('items must be an array');
    await expect(upsertCart(testUser, [{ text: 123 }])).rejects.toThrow('item.text must be a string');
  });

  test('getCartByUsername throws on missing username', async () => {
    await expect(getCartByUsername()).rejects.toThrow('username is required');
  });
});
