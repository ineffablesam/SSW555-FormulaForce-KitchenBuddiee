import request from 'supertest';
import { expect } from 'chai';
import app from '../server.js';
import { dbConnection } from '../config/mongoConnection.js';
import bcrypt from 'bcryptjs';

describe('Auth Routes - Authentication & Profile Management', () => {
    let db;
    const testUser = {
        username: 'testuser',
        password: 'Test@123'
    };
    const anotherUser = {
        username: 'anotheruser',
        password: 'Another@123'
    };

    before(async () => {
        db = await dbConnection();
    });

    beforeEach(async () => {
        // Clear users collection before each test
        await db.collection('users').deleteMany({});
    });

    after(async () => {
        // Cleanup
        await db.collection('users').deleteMany({});
    });

    // ==================== SIGNUP TESTS ====================

    describe('POST /api/auth/signup', () => {

        it('should create a new user with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send(testUser)
                .expect(201);

            expect(res.body).to.have.property('message', 'User created');
            expect(res.body).to.have.property('username', testUser.username);

            // Verify user exists in database
            const user = await db.collection('users').findOne({ username: testUser.username });
            expect(user).to.not.be.null;
            expect(user.username).to.equal(testUser.username);
            expect(user.password).to.not.equal(testUser.password); // Should be hashed
        });

        it('should return 400 when username is missing', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({ password: 'Test@123' })
                .expect(400);

            expect(res.body.message).to.include('username and password required');
        });

        it('should return 400 when password is missing', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({ username: 'testuser' })
                .expect(400);

            expect(res.body.message).to.include('username and password required');
        });

        it('should return 400 when both username and password are missing', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({})
                .expect(400);

            expect(res.body.message).to.include('username and password required');
        });

        it('should return 409 when username already exists', async () => {
            // Create first user
            await request(app)
                .post('/api/auth/signup')
                .send(testUser)
                .expect(201);

            // Try to create duplicate
            const res = await request(app)
                .post('/api/auth/signup')
                .send(testUser)
                .expect(409);

            expect(res.body.message).to.include('already exists');
        });

        it('should hash the password before storing', async () => {
            await request(app)
                .post('/api/auth/signup')
                .send(testUser)
                .expect(201);

            const user = await db.collection('users').findOne({ username: testUser.username });
            expect(user.password).to.not.equal(testUser.password);

            // Verify it's a bcrypt hash
            const isValidHash = await bcrypt.compare(testUser.password, user.password);
            expect(isValidHash).to.be.true;
        });

        it('should initialize profile fields with defaults', async () => {
            await request(app)
                .post('/api/auth/signup')
                .send(testUser)
                .expect(201);

            const user = await db.collection('users').findOne({ username: testUser.username });
            expect(user).to.have.property('bio');
            expect(user).to.have.property('profilePicture');
            expect(user).to.have.property('createdAt');
        });
    });

    // ==================== SIGNIN TESTS ====================

    describe('POST /api/auth/signin', () => {

        beforeEach(async () => {
            // Create a user for signin tests
            await request(app)
                .post('/api/auth/signup')
                .send(testUser);
        });

        it('should sign in with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/signin')
                .send(testUser)
                .expect(200);

            expect(res.body).to.have.property('message', 'Signed in');
            expect(res.body).to.have.property('username', testUser.username);
        });

        it('should return 400 when username is missing', async () => {
            const res = await request(app)
                .post('/api/auth/signin')
                .send({ password: testUser.password })
                .expect(400);

            expect(res.body.message).to.include('username and password required');
        });

        it('should return 400 when password is missing', async () => {
            const res = await request(app)
                .post('/api/auth/signin')
                .send({ username: testUser.username })
                .expect(400);

            expect(res.body.message).to.include('username and password required');
        });

        it('should return 401 when user does not exist', async () => {
            const res = await request(app)
                .post('/api/auth/signin')
                .send({ username: 'nonexistent', password: 'Test@123' })
                .expect(401);

            expect(res.body.message).to.include('Invalid');
        });

        it('should return 401 when password is incorrect', async () => {
            const res = await request(app)
                .post('/api/auth/signin')
                .send({ username: testUser.username, password: 'WrongPassword' })
                .expect(401);

            expect(res.body.message).to.include('Invalid');
        });

        it('should be case-sensitive for username', async () => {
            const res = await request(app)
                .post('/api/auth/signin')
                .send({ username: testUser.username.toUpperCase(), password: testUser.password })
                .expect(401);
        });
    });

    // ==================== GET PROFILE TESTS ====================

    describe('GET /api/auth/profile/:username', () => {

        beforeEach(async () => {
            // Create user with profile data
            const hashedPassword = await bcrypt.hash(testUser.password, 10);
            await db.collection('users').insertOne({
                username: testUser.username,
                password: hashedPassword,
                bio: 'I love cooking!',
                profilePicture: 'https://example.com/profile.jpg',
                createdAt: new Date()
            });
        });

        it('should return user profile with valid username', async () => {
            const res = await request(app)
                .get(`/api/auth/profile/${testUser.username}`)
                .expect(200);

            expect(res.body).to.have.property('profile');
            expect(res.body.profile).to.have.property('username', testUser.username);
            expect(res.body.profile).to.have.property('bio', 'I love cooking!');
            expect(res.body.profile).to.have.property('profilePicture', 'https://example.com/profile.jpg');
        });

        it('should not return password in profile', async () => {
            const res = await request(app)
                .get(`/api/auth/profile/${testUser.username}`)
                .expect(200);

            expect(res.body.profile).to.not.have.property('password');
        });

        it('should return 404 when user does not exist', async () => {
            const res = await request(app)
                .get('/api/auth/profile/nonexistentuser')
                .expect(404);

            expect(res.body.message).to.include('not found');
        });

        it('should return profile with default values if bio/picture not set', async () => {
            const hashedPassword = await bcrypt.hash(anotherUser.password, 10);
            await db.collection('users').insertOne({
                username: anotherUser.username,
                password: hashedPassword,
                bio: '',
                profilePicture: null,
                createdAt: new Date()
            });

            const res = await request(app)
                .get(`/api/auth/profile/${anotherUser.username}`)
                .expect(200);

            expect(res.body.profile).to.have.property('bio');
            expect(res.body.profile).to.have.property('profilePicture');
        });
    });

    // ==================== UPDATE PROFILE TESTS ====================

    describe('PUT /api/auth/update-profile', () => {

        beforeEach(async () => {
            // Create user
            const hashedPassword = await bcrypt.hash(testUser.password, 10);
            await db.collection('users').insertOne({
                username: testUser.username,
                password: hashedPassword,
                bio: 'Old bio',
                profilePicture: null,
                createdAt: new Date()
            });
        });

        it('should update user bio', async () => {
            const newBio = 'I am a passionate home chef';

            const res = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    username: testUser.username,
                    bio: newBio
                })
                .expect(200);

            expect(res.body).to.have.property('message', 'Profile updated');
            expect(res.body.profile).to.have.property('bio', newBio);

            // Verify in database
            const user = await db.collection('users').findOne({ username: testUser.username });
            expect(user.bio).to.equal(newBio);
        });

        it('should update profile picture', async () => {
            const newProfilePicture = 'https://example.com/new-profile.jpg';

            const res = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    username: testUser.username,
                    profilePicture: newProfilePicture
                })
                .expect(200);

            expect(res.body.profile).to.have.property('profilePicture', newProfilePicture);

            // Verify in database
            const user = await db.collection('users').findOne({ username: testUser.username });
            expect(user.profilePicture).to.equal(newProfilePicture);
        });

        it('should update both bio and profile picture', async () => {
            const newBio = 'Updated bio';
            const newProfilePicture = 'https://example.com/updated.jpg';

            const res = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    username: testUser.username,
                    bio: newBio,
                    profilePicture: newProfilePicture
                })
                .expect(200);

            expect(res.body.profile).to.have.property('bio', newBio);
            expect(res.body.profile).to.have.property('profilePicture', newProfilePicture);
        });

        it('should return 400 when username is missing', async () => {
            const res = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    bio: 'New bio'
                })
                .expect(400);

            expect(res.body.message).to.include('username is required');
        });

        it('should return 404 when user does not exist', async () => {
            const res = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    username: 'nonexistentuser',
                    bio: 'New bio'
                })
                .expect(404);

            expect(res.body.message).to.include('not found');
        });

        it('should allow empty bio', async () => {
            const res = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    username: testUser.username,
                    bio: ''
                })
                .expect(200);

            expect(res.body.profile).to.have.property('bio', '');
        });

        it('should allow null profile picture', async () => {
            const res = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    username: testUser.username,
                    profilePicture: null
                })
                .expect(200);

            expect(res.body.profile.profilePicture).to.be.null;
        });

        it('should validate profile picture URL format', async () => {
            const res = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    username: testUser.username,
                    profilePicture: 'not-a-valid-url'
                })
                .expect(400);

            expect(res.body.message).to.include('valid URL');
        });

        it('should limit bio length', async () => {
            const longBio = 'a'.repeat(1001); // Assuming 1000 char limit

            const res = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    username: testUser.username,
                    bio: longBio
                })
                .expect(400);

            expect(res.body.message).to.include('too long');
        });

        it('should not modify password when updating profile', async () => {
            const originalUser = await db.collection('users').findOne({ username: testUser.username });
            const originalPassword = originalUser.password;

            await request(app)
                .put('/api/auth/update-profile')
                .send({
                    username: testUser.username,
                    bio: 'New bio'
                })
                .expect(200);

            const updatedUser = await db.collection('users').findOne({ username: testUser.username });
            expect(updatedUser.password).to.equal(originalPassword);
        });

        it('should support base64 encoded images', async () => {
            const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

            const res = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    username: testUser.username,
                    profilePicture: base64Image
                })
                .expect(200);

            expect(res.body.profile.profilePicture).to.equal(base64Image);
        });
    });

    // ==================== DELETE ACCOUNT TESTS ====================

    describe('POST /api/auth/delete-account', () => {

        beforeEach(async () => {
            // Create user
            await request(app)
                .post('/api/auth/signup')
                .send(testUser);

            // Add some user data (recipes, favorites, cart)
            await db.collection('recipes').insertOne({
                username: testUser.username,
                title: 'Test Recipe',
                ingredients: ['test'],
                steps: ['test']
            });

            await db.collection('favorites').insertOne({
                username: testUser.username,
                recipeId: 'test-id'
            });

            await db.collection('cart').insertOne({
                username: testUser.username,
                items: []
            });
        });

        it('should delete user account with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/delete-account')
                .send(testUser)
                .expect(200);

            expect(res.body).to.have.property('message', 'Account deleted');

            // Verify user is deleted
            const user = await db.collection('users').findOne({ username: testUser.username });
            expect(user).to.be.null;
        });

        it('should delete all user-related data', async () => {
            await request(app)
                .post('/api/auth/delete-account')
                .send(testUser)
                .expect(200);

            // Verify all related data is deleted
            const recipes = await db.collection('recipes').find({ username: testUser.username }).toArray();
            const favorites = await db.collection('favorites').find({ username: testUser.username }).toArray();
            const cart = await db.collection('cart').find({ username: testUser.username }).toArray();

            expect(recipes).to.be.empty;
            expect(favorites).to.be.empty;
            expect(cart).to.be.empty;
        });

        it('should return 400 when username is missing', async () => {
            const res = await request(app)
                .post('/api/auth/delete-account')
                .send({ password: testUser.password })
                .expect(400);

            expect(res.body.message).to.include('username and password required');
        });

        it('should return 400 when password is missing', async () => {
            const res = await request(app)
                .post('/api/auth/delete-account')
                .send({ username: testUser.username })
                .expect(400);

            expect(res.body.message).to.include('username and password required');
        });

        it('should return 401 when password is incorrect', async () => {
            const res = await request(app)
                .post('/api/auth/delete-account')
                .send({ username: testUser.username, password: 'WrongPassword' })
                .expect(401);

            expect(res.body.message).to.include('Invalid');

            // Verify user still exists
            const user = await db.collection('users').findOne({ username: testUser.username });
            expect(user).to.not.be.null;
        });

        it('should return 404 when user does not exist', async () => {
            const res = await request(app)
                .post('/api/auth/delete-account')
                .send({ username: 'nonexistent', password: 'Test@123' })
                .expect(404);
        });
    });

    // ==================== INTEGRATION TESTS ====================

    describe('Integration: Complete User Lifecycle', () => {

        it('should complete full user lifecycle: signup -> update profile -> get profile -> delete', async () => {
            // 1. Signup
            let res = await request(app)
                .post('/api/auth/signup')
                .send(testUser)
                .expect(201);

            expect(res.body.username).to.equal(testUser.username);

            // 2. Update profile
            res = await request(app)
                .put('/api/auth/update-profile')
                .send({
                    username: testUser.username,
                    bio: 'My cooking journey',
                    profilePicture: 'https://example.com/me.jpg'
                })
                .expect(200);

            expect(res.body.profile.bio).to.equal('My cooking journey');

            // 3. Get profile
            res = await request(app)
                .get(`/api/auth/profile/${testUser.username}`)
                .expect(200);

            expect(res.body.profile.bio).to.equal('My cooking journey');
            expect(res.body.profile.profilePicture).to.equal('https://example.com/me.jpg');

            // 4. Delete account
            res = await request(app)
                .post('/api/auth/delete-account')
                .send(testUser)
                .expect(200);

            // 5. Verify user is gone
            res = await request(app)
                .get(`/api/auth/profile/${testUser.username}`)
                .expect(404);
        });

        it('should not allow signin after account deletion', async () => {
            // Create and delete user
            await request(app)
                .post('/api/auth/signup')
                .send(testUser);

            await request(app)
                .post('/api/auth/delete-account')
                .send(testUser);

            // Try to signin
            const res = await request(app)
                .post('/api/auth/signin')
                .send(testUser)
                .expect(401);

            expect(res.body.message).to.include('Invalid');
        });

        it('should allow new signup with same username after account deletion', async () => {
            // Create and delete user
            await request(app)
                .post('/api/auth/signup')
                .send(testUser);

            await request(app)
                .post('/api/auth/delete-account')
                .send(testUser);

            // Create new user with same username
            const res = await request(app)
                .post('/api/auth/signup')
                .send(testUser)
                .expect(201);

            expect(res.body.username).to.equal(testUser.username);
        });
    });
});