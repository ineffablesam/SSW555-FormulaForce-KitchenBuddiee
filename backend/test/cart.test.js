import { expect } from 'chai';
import {
    getCartByUsername,
    upsertCart,
    deleteCart,
    removeCartItem,
    removeRecipeIngredients,
    addRecipeToCart
} from '../data/shoppingCart.js';
import { cart } from '../config/mongoCollections.js';

describe('Shopping Cart Data Layer Tests', function () {
    this.timeout(10000);

    const testUsername = 'testuser_cart_' + Date.now();

    // Clean up before and after tests
    beforeEach(async function () {
        const col = await cart();
        await col.deleteMany({ username: testUsername });
    });

    afterEach(async function () {
        const col = await cart();
        await col.deleteMany({ username: testUsername });
    });

    describe('getCartByUsername', function () {
        it('should return empty cart for new user', async function () {
            const result = await getCartByUsername(testUsername);
            expect(result).to.be.an('object');
            expect(result.username).to.equal(testUsername);
            expect(result.items).to.be.an('array');
            expect(result.items).to.have.lengthOf(0);
        });

        it('should return existing cart', async function () {
            const items = [
                { text: 'tomato', qty: 2, checked: false },
                { text: 'onion', qty: 1, checked: true }
            ];
            await upsertCart(testUsername, items);

            const result = await getCartByUsername(testUsername);
            expect(result.items).to.have.lengthOf(2);
            expect(result.items[0].text).to.equal('tomato');
            expect(result.items[1].checked).to.be.true;
        });

        it('should throw error for invalid username', async function () {
            try {
                await getCartByUsername('');
                expect.fail('Should have thrown error');
            } catch (err) {
                expect(err.message).to.include('username');
            }
        });
    });

    describe('upsertCart', function () {
        it('should create new cart', async function () {
            const items = [{ text: 'milk', qty: 1, checked: false }];
            const result = await upsertCart(testUsername, items);

            expect(result.success).to.be.true;

            const cart = await getCartByUsername(testUsername);
            expect(cart.items).to.have.lengthOf(1);
            expect(cart.items[0].text).to.equal('milk');
        });

        it('should update existing cart', async function () {
            await upsertCart(testUsername, [{ text: 'bread', qty: 1, checked: false }]);

            const newItems = [
                { text: 'bread', qty: 2, checked: true },
                { text: 'butter', qty: 1, checked: false }
            ];
            await upsertCart(testUsername, newItems);

            const cart = await getCartByUsername(testUsername);
            expect(cart.items).to.have.lengthOf(2);
            expect(cart.items[0].qty).to.equal(2);
            expect(cart.items[0].checked).to.be.true;
        });

        it('should validate items array', async function () {
            try {
                await upsertCart(testUsername, 'not an array');
                expect.fail('Should have thrown error');
            } catch (err) {
                expect(err.message).to.include('array');
            }
        });

        it('should validate item structure', async function () {
            try {
                await upsertCart(testUsername, [{ invalid: 'item' }]);
                expect.fail('Should have thrown error');
            } catch (err) {
                expect(err.message).to.include('text');
            }
        });
    });

    describe('deleteCart', function () {
        it('should delete existing cart', async function () {
            await upsertCart(testUsername, [{ text: 'eggs', qty: 12, checked: false }]);

            const result = await deleteCart(testUsername);
            expect(result.deleted).to.be.true;

            const cart = await getCartByUsername(testUsername);
            expect(cart.items).to.have.lengthOf(0);
        });

        it('should throw error when deleting non-existent cart', async function () {
            try {
                await deleteCart(testUsername);
                expect.fail('Should have thrown error');
            } catch (err) {
                expect(err.status).to.equal(404);
            }
        });
    });

    describe('removeCartItem', function () {
        it('should remove single item from cart', async function () {
            const items = [
                { text: 'apple', qty: 3, checked: false },
                { text: 'banana', qty: 2, checked: false }
            ];
            await upsertCart(testUsername, items);

            const result = await removeCartItem(testUsername, 'apple');
            expect(result.removed).to.be.true;
            expect(result.items).to.have.lengthOf(1);
            expect(result.items[0].text).to.equal('banana');
        });

        it('should return false when item not found', async function () {
            await upsertCart(testUsername, [{ text: 'orange', qty: 1, checked: false }]);

            const result = await removeCartItem(testUsername, 'grape');
            expect(result.removed).to.be.false;
            expect(result.items).to.have.lengthOf(1);
        });

        it('should handle empty cart', async function () {
            const result = await removeCartItem(testUsername, 'anything');
            expect(result.removed).to.be.false;
            expect(result.items).to.have.lengthOf(0);
        });
    });

    describe('removeRecipeIngredients', function () {
        it('should remove recipe ingredients from cart', async function () {
            const items = [
                { text: 'tomato', qty: 3, checked: false },
                { text: 'onion', qty: 2, checked: false },
                { text: 'garlic', qty: 1, checked: false }
            ];
            await upsertCart(testUsername, items);

            const recipe = {
                ingredients: ['tomato', 'onion']
            };

            const result = await removeRecipeIngredients(testUsername, recipe);
            expect(result.removed).to.be.true;
            expect(result.changedCount).to.equal(2);
            expect(result.items).to.have.lengthOf(2); // tomato qty=2, garlic qty=1
        });

        it('should decrement quantities correctly', async function () {
            const items = [
                { text: 'flour', qty: 5, checked: false }
            ];
            await upsertCart(testUsername, items);

            const recipe = {
                ingredients: ['flour', 'flour'] // 2 cups of flour
            };

            const result = await removeRecipeIngredients(testUsername, recipe);
            expect(result.items).to.have.lengthOf(1);
            expect(result.items[0].qty).to.equal(3);
        });

        it('should remove item when qty reaches 0', async function () {
            const items = [
                { text: 'salt', qty: 1, checked: false }
            ];
            await upsertCart(testUsername, items);

            const recipe = {
                ingredients: ['salt']
            };

            const result = await removeRecipeIngredients(testUsername, recipe);
            expect(result.items).to.have.lengthOf(0);
            expect(result.removedTexts).to.include('salt');
        });

        it('should validate recipe object', async function () {
            try {
                await removeRecipeIngredients(testUsername, null);
                expect.fail('Should have thrown error');
            } catch (err) {
                expect(err.message).to.include('recipe');
            }
        });
    });

    describe('addRecipeToCart', function () {
        it('should add recipe ingredients to empty cart', async function () {
            const recipe = {
                ingredients: ['chicken', 'rice', 'vegetables']
            };

            const result = await addRecipeToCart(testUsername, recipe);
            expect(result.success).to.be.true;
            expect(result.addedCount).to.equal(3);
            expect(result.totalItems).to.equal(3);

            const cart = await getCartByUsername(testUsername);
            expect(cart.items).to.have.lengthOf(3);
        });

        it('should increment quantities for existing ingredients', async function () {
            await upsertCart(testUsername, [
                { text: 'pasta', qty: 1, checked: false }
            ]);

            const recipe = {
                ingredients: ['pasta', 'tomato sauce']
            };

            const result = await addRecipeToCart(testUsername, recipe);
            expect(result.success).to.be.true;

            const cart = await getCartByUsername(testUsername);
            expect(cart.items).to.have.lengthOf(2);

            const pastaItem = cart.items.find(item => item.text === 'pasta');
            expect(pastaItem.qty).to.equal(2);
        });

        it('should handle duplicate ingredients in recipe', async function () {
            const recipe = {
                ingredients: ['egg', 'egg', 'egg'] // 3 eggs
            };

            const result = await addRecipeToCart(testUsername, recipe);

            const cart = await getCartByUsername(testUsername);
            expect(cart.items).to.have.lengthOf(1);
            expect(cart.items[0].qty).to.equal(3);
        });

        it('should preserve checked status of existing items', async function () {
            await upsertCart(testUsername, [
                { text: 'sugar', qty: 1, checked: true }
            ]);

            const recipe = {
                ingredients: ['sugar', 'flour']
            };

            await addRecipeToCart(testUsername, recipe);

            const cart = await getCartByUsername(testUsername);
            const sugarItem = cart.items.find(item => item.text === 'sugar');
            expect(sugarItem.checked).to.be.true;
            expect(sugarItem.qty).to.equal(2);
        });

        it('should validate recipe has ingredients array', async function () {
            try {
                await addRecipeToCart(testUsername, { title: 'Test' });
                expect.fail('Should have thrown error');
            } catch (err) {
                expect(err.message).to.include('ingredients');
            }
        });

        it('should skip invalid ingredients', async function () {
            const recipe = {
                ingredients: ['valid', null, '', '  ', 123, 'another valid']
            };

            const result = await addRecipeToCart(testUsername, recipe);

            const cart = await getCartByUsername(testUsername);
            expect(cart.items).to.have.lengthOf(2);
        });
    });

    describe('Edge Cases and Error Handling', function () {
        it('should handle special characters in ingredient names', async function () {
            const items = [
                { text: 'jalapeño peppers', qty: 1, checked: false },
                { text: 'crème fraîche', qty: 1, checked: false }
            ];

            await upsertCart(testUsername, items);
            const cart = await getCartByUsername(testUsername);
            expect(cart.items).to.have.lengthOf(2);
        });

        it('should handle very long ingredient names', async function () {
            const longName = 'a'.repeat(500);
            const items = [{ text: longName, qty: 1, checked: false }];

            await upsertCart(testUsername, items);
            const cart = await getCartByUsername(testUsername);
            expect(cart.items[0].text).to.equal(longName);
        });

        it('should handle large quantities', async function () {
            const items = [{ text: 'rice', qty: 999999, checked: false }];

            await upsertCart(testUsername, items);
            const cart = await getCartByUsername(testUsername);
            expect(cart.items[0].qty).to.equal(999999);
        });

        it('should handle concurrent updates gracefully', async function () {
            const recipe1 = { ingredients: ['item1', 'item2'] };
            const recipe2 = { ingredients: ['item2', 'item3'] };

            await Promise.all([
                addRecipeToCart(testUsername, recipe1),
                addRecipeToCart(testUsername, recipe2)
            ]);

            const cart = await getCartByUsername(testUsername);
            expect(cart.items.length).to.be.at.least(2);
        });
    });

    describe('Integration Tests', function () {
        it('should handle complete workflow: add, update, remove', async function () {
            // Add recipe
            const recipe = {
                ingredients: ['ingredient1', 'ingredient2', 'ingredient3']
            };
            await addRecipeToCart(testUsername, recipe);

            let cart = await getCartByUsername(testUsername);
            expect(cart.items).to.have.lengthOf(3);

            // Update cart (check items)
            const updatedItems = cart.items.map(item => ({
                ...item,
                checked: item.text === 'ingredient1'
            }));
            await upsertCart(testUsername, updatedItems);

            cart = await getCartByUsername(testUsername);
            const checkedItem = cart.items.find(item => item.text === 'ingredient1');
            expect(checkedItem.checked).to.be.true;

            // Remove single item
            await removeCartItem(testUsername, 'ingredient2');

            cart = await getCartByUsername(testUsername);
            expect(cart.items).to.have.lengthOf(2);

            // Delete entire cart
            await deleteCart(testUsername);

            cart = await getCartByUsername(testUsername);
            expect(cart.items).to.have.lengthOf(0);
        });

        it('should handle multiple recipes workflow', async function () {
            const recipe1 = {
                ingredients: ['flour', 'sugar', 'eggs']
            };
            const recipe2 = {
                ingredients: ['flour', 'butter', 'milk']
            };

            await addRecipeToCart(testUsername, recipe1);
            await addRecipeToCart(testUsername, recipe2);

            const cart = await getCartByUsername(testUsername);
            expect(cart.items).to.have.lengthOf(5); // flour appears twice but counted once

            const flourItem = cart.items.find(item => item.text === 'flour');
            expect(flourItem.qty).to.equal(2);
        });
    });
});
