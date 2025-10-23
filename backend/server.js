import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRouter from './routes/auth.js';

import recipesRouter from './routes/recipes.js';
import path from 'path';


const app = express();
const __dirname = path.resolve();

const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/recipes', recipesRouter);

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Kitchen Buddiee backend running' });
});

// error handler
// Error handler
app.use((err, req, res, next) => {
  void next;
  console.error('Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server listening on port ${PORT}`);
  console.log(`📍 Routes available:`);
  console.log(`   - POST   /api/recipes`);
  console.log(`   - GET    /api/recipes/user/:username`);
  console.log(`   - GET    /api/recipes/:id`);
  console.log(`   - PUT    /api/recipes/:id`);
  console.log(`   - DELETE /api/recipes/:id`);
});