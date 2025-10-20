import express from 'express';
import createHttpError from 'http-errors';
import { createUser } from '../data/users.js';

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

export default router;
