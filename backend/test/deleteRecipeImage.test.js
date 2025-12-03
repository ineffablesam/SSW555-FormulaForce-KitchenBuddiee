import request from 'supertest';
import { expect } from 'chai';
import app from '../server.js';
import { dbConnection } from '../config/mongoConnection.js';
import { ObjectId } from 'mongodb';

describe('Recipe Routes - Delete Recipe Image', () => {
    let db;
    let testRecipeId;
    const testUser = {
        username: 'imageuser',
        password: 'Image@123'
    };

    before(async () => {
        db = await dbConnection();
    });

    beforeEach(async () => {
        // Clear collections
        await db.collection('users').deleteMany({});
        await db.collection('recipes').deleteMany({});

        // Create test user
        await request(app)
            .post('/api/auth/signup')
            .send(testUser);

        // Create a test recipe with an image
        const recipeData = {
            title: 'Test Recipe with Image',
            description: 'A test recipe',
            ingredients: ['ingredient1', 'ingredient2'],
            instructions: ['step1', 'step2'],
            prepTime: 10,
            cookTime: 20,
            servings: 4,
            difficulty: 'easy',
            image: 'https://example.com/test-image.jpg',
            username: testUser.username
        };

        const recipe = await db.collection('recipes').insertOne(recipeData);
        testRecipeId = recipe.insertedId.toString();
    });

    after(async () => {
        // Cleanup
        await db.collection('users').deleteMany({});
        await db.collection('recipes').deleteMany({});
    });

    describe('PATCH /api/recipes/:id/image', () => {

        it('should successfully delete image from recipe', async () => {
            // Login as recipe owner
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send(testUser)
                .expect(200);

            const cookie = loginRes.headers['set-cookie'];

            // Delete the image
            const res = await request(app)
                .patch(`/api/recipes/${testRecipeId}/image`)
                .set('Cookie', cookie)
                .expect(200);

            expect(res.body).to.have.property('success', true);
            expect(res.body).to.have.property('message', 'Recipe image deleted successfully');
            expect(res.body).to.have.property('recipe');
            expect(res.body.recipe).to.have.property('image', null);

            // Verify in database
            const recipe = await db.collection('recipes').findOne({ _id: new ObjectId(testRecipeId) });
            expect(recipe.image).to.be.null;
        });

    });
});
