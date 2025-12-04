import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.js';
import path from 'path';

import recipesRouter from './routes/recipes.js';
import cartRouter from './routes/cart.js';
import categoriesRouter from './routes/categories.js';
import favoritesRouter from './routes/favorites.js';

const app = express();
const __dirname = path.resolve();

const PORT = process.env.PORT || 4000;

app.use(helmet());

// ✅ SINGLE CORS configuration with credentials
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookieParser());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Set default headers for JSON responses
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/recipes', recipesRouter);
app.use('/api/cart', cartRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/favorites', favoritesRouter);

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Kitchen Buddiee backend running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: true,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server listening on port ${PORT}`);
  console.log(`📍 Routes available:`);
  console.log(`   - POST   /api/recipes`);
  console.log(`   - GET    /api/recipes`);
  console.log(`   - GET    /api/recipes/user/:username`);
  console.log(`   - GET    /api/recipes/:id`);
  console.log(`   - PUT    /api/recipes/:id`);
  console.log(`   - DELETE /api/recipes/:id`);
});