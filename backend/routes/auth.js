import express from 'express';
import createHttpError from 'http-errors';
import {
  createUser,
  authenticateUser,
  deleteUserAndData,
  getUserProfile,
  updateUserProfile
} from '../data/users.js';

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      throw createHttpError(400, 'username and password required');
    }

    const result = await createUser(username, password);
    return res.status(201).json({ message: 'User created', ...result });
  } catch (err) {
    // translate errors with err.status if present
    if (err && err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    // default fallback
    return next(err);
  }
});


// POST /api/auth/signin
router.post('/signin', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      throw createHttpError(400, 'username and password required');
    }

    const result = await authenticateUser(username, password);
    return res.status(200).json({ message: 'Signed in', username: result.username });
  } catch (err) {
    if (err && err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    return next(err);
  }
});

// POST /api/auth/delete-account
router.post('/delete-account', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      throw createHttpError(400, 'username and password required');
    }

    await deleteUserAndData(username, password);
    return res.status(200).json({ message: 'Account deleted' });
  } catch (err) {
    if (err && err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    return next(err);
  }
});

// GET /api/auth/profile/:username
router.get('/profile/:username', async (req, res, next) => {
  try {
    const { username } = req.params;
    if (!username) {
      throw createHttpError(400, 'username is required');
    }

    const profile = await getUserProfile(username);
    return res.status(200).json({ profile });
  } catch (err) {
    if (err && err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    return next(err);
  }
});

// PUT /api/auth/update-profile
router.put('/update-profile', async (req, res, next) => {
  try {
    const { username, bio, profilePicture } = req.body || {};
    if (!username) {
      throw createHttpError(400, 'username is required');
    }

    const profile = await updateUserProfile(username, bio, profilePicture);
    return res.status(200).json({ message: 'Profile updated', profile });
  } catch (err) {
    if (err && err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    return next(err);
  }
});

export default router;