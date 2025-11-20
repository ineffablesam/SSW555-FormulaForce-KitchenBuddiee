import request from 'supertest';
import { expect } from 'chai';
import app from '../server.js';
import { dbConnection } from '../config/mongoConnection.js';

describe('Recipe Privacy Feature', () => {
    let db;
    const userA = {
        username: 'userA',
        password: 'Password@123'
    };
    const userB = {
        username: 'userB',
        password: 'Password@123'
    };

    let userACookie;
    let userBCookie;

    before(async () => {
        db = await dbConnection();
        // Clear collections
        await db.collection('users').deleteMany({});
        await db.collection('recipes').deleteMany({});

        // Create User A
        await request(app)
            .post('/api/auth/signup')
            .send(userA);

        // Login User A to get cookie
        const resA = await request(app)
            .post('/api/auth/signin')
            .send(userA);
        userACookie = resA.headers['set-cookie'];

        // Create User B
        await request(app)
            .post('/api/auth/signup')
            .send(userB);

        // Login User B to get cookie
        const resB = await request(app)
            .post('/api/auth/signin')
            .send(userB);
        userBCookie = resB.headers['set-cookie'];
    });

    after(async () => {
        await db.collection('users').deleteMany({});
        await db.collection('recipes').deleteMany({});
    });

    beforeEach(async () => {
        // Clear recipes before each test
        await db.collection('recipes').deleteMany({});
    });

    it('should create a public recipe by default', async () => {
        const recipeData = {
            title: 'Public Recipe',
            prepTime: 10,
            cookTime: 20,
            servings: 4,
            ingredients: ['ing1'],
            steps: ['step1'],
            username: userA.username
        };

        const res = await request(app)
            .post('/api/recipes')
            .set('Cookie', userACookie)
            .send(recipeData)
            .expect(200);

        expect(res.body.recipe).to.have.property('isPrivate', false);
    });

    it('should create a private recipe when isPrivate is true', async () => {
        const recipeData = {
            title: 'Private Recipe',
            prepTime: 10,
            cookTime: 20,
            servings: 4,
            ingredients: ['ing1'],
            steps: ['step1'],
            username: userA.username,
            isPrivate: true
        };

        const res = await request(app)
            .post('/api/recipes')
            .set('Cookie', userACookie)
            .send(recipeData)
            .expect(200);

        expect(res.body.recipe).to.have.property('isPrivate', true);
    });

    it('should allow owner to see their private recipe', async () => {
        // Create private recipe as User A
        await db.collection('recipes').insertOne({
            title: 'Private Recipe',
            prepTime: 10,
            cookTime: 20,
            servings: 4,
            ingredients: ['ing1'],
            steps: ['step1'],
            username: userA.username,
            isPrivate: true,
            createdAt: new Date()
        });

        const res = await request(app)
            .get('/api/recipes')
            .set('Cookie', userACookie)
            .expect(200);

        const recipes = res.body;
        const privateRecipe = recipes.find(r => r.title === 'Private Recipe');
        expect(privateRecipe).to.not.be.undefined;
    });

    it('should NOT allow other users to see private recipes', async () => {
        // Create private recipe as User A
        await db.collection('recipes').insertOne({
            title: 'Private Recipe',
            prepTime: 10,
            cookTime: 20,
            servings: 4,
            ingredients: ['ing1'],
            steps: ['step1'],
            username: userA.username,
            isPrivate: true,
            createdAt: new Date()
        });

        // Fetch as User B
        const res = await request(app)
            .get('/api/recipes')
            .set('Cookie', userBCookie)
            .expect(200);

        const recipes = res.body;
        const privateRecipe = recipes.find(r => r.title === 'Private Recipe');
        expect(privateRecipe).to.be.undefined;
    });

    it('should NOT allow anonymous users to see private recipes', async () => {
        // Create private recipe as User A
        await db.collection('recipes').insertOne({
            title: 'Private Recipe',
            prepTime: 10,
            cookTime: 20,
            servings: 4,
            ingredients: ['ing1'],
            steps: ['step1'],
            username: userA.username,
            isPrivate: true,
            createdAt: new Date()
        });

        // Fetch without cookie
        const res = await request(app)
            .get('/api/recipes')
            .expect(200);

        const recipes = res.body;
        const privateRecipe = recipes.find(r => r.title === 'Private Recipe');
        expect(privateRecipe).to.be.undefined;
    });

    it('should allow everyone to see public recipes', async () => {
        // Create public recipe as User A
        await db.collection('recipes').insertOne({
            title: 'Public Recipe',
            prepTime: 10,
            cookTime: 20,
            servings: 4,
            ingredients: ['ing1'],
            steps: ['step1'],
            username: userA.username,
            isPrivate: false,
            createdAt: new Date()
        });

        // Fetch as User B
        const resB = await request(app)
            .get('/api/recipes')
            .set('Cookie', userBCookie)
            .expect(200);

        expect(resB.body.find(r => r.title === 'Public Recipe')).to.not.be.undefined;

        // Fetch as Anonymous
        const resAnon = await request(app)
            .get('/api/recipes')
            .expect(200);

        expect(resAnon.body.find(r => r.title === 'Public Recipe')).to.not.be.undefined;
    });
});
