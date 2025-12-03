import request from 'supertest';
import { expect } from 'chai';
import app from '../server.js';
import { dbConnection } from '../config/mongoConnection.js';
import { ObjectId } from 'mongodb';

describe('Recipe Privacy Toggle', () => {
    let db;
    let testRecipeId;
    const testUser = {
        username: 'privacyuser',
        password: 'Privacy@123'
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

        // Create a test recipe (public by default)
        const recipeData = {
            title: 'Test Recipe for Privacy',
            description: 'A test recipe',
            ingredients: ['ingredient1', 'ingredient2'],
            instructions: ['step1', 'step2'],
            prepTime: 10,
            cookTime: 20,
            servings: 4,
            difficulty: 'easy',
            isPrivate: false,
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

    describe('PATCH /api/recipes/:id/privacy', () => {

        it('should toggle recipe from public to private', async () => {
            // Login as recipe owner
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send(testUser)
                .expect(200);

            const cookie = loginRes.headers['set-cookie'];

            // Toggle privacy to private
            const res = await request(app)
                .patch(`/api/recipes/${testRecipeId}/privacy`)
                .set('Cookie', cookie)
                .send({ isPrivate: true })
                .expect(200);

            expect(res.body).to.have.property('success', true);
            expect(res.body).to.have.property('message', 'Recipe marked as private');
            expect(res.body.recipe).to.have.property('isPrivate', true);

            // Verify in database
            const recipe = await db.collection('recipes').findOne({ _id: new ObjectId(testRecipeId) });
            expect(recipe.isPrivate).to.be.true;
        });

    });
});
