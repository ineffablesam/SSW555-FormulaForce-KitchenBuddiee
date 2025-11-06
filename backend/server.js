import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import authRouter from './routes/auth.js';
import routes from './routes/auth.js';
import path from 'path';

import recipesRouter from './routes/recipes.js';
import cartRouter from './routes/cart.js';
import categoriesRouter from './routes/categories.js';



const app = express();
const __dirname = path.resolve();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//const app = express();
const PORT = process.env.PORT || 4000;



app.use(helmet());
//app.use(cors());
app.use(cors({
  origin: 'http://localhost:5173', // replace with your frontend URL
  credentials: true,
}));
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/recipes', recipesRouter);
app.use('/api/cart', cartRouter);
app.use('/api/categories', categoriesRouter);

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Kitchen Buddiee backend running' });
});

// error handler
// app.use((err, req, res, next) => {
//   void next;
//   console.error(err);
//   const status = err.status || 500;
//   res.status(status).json({ message: err.message || 'Internal Server Error' });
// });

app.use('/', routes);

app.listen(PORT, () => {
  console.log(`🚀 Backend server listening on port ${PORT}`);
  console.log(`📍 Routes available:`);
  console.log(`   - POST   /api/recipes`);
  console.log(`   - GET    /api/recipes/user/:username`);
  console.log(`   - GET    /api/recipes/:id`);
  console.log(`   - PUT    /api/recipes/:id`);
  console.log(`   - DELETE /api/recipes/:id`);
});
