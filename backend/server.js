import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import authRouter from './routes/auth.js';
import routes from './routes/auth.js';
import path from 'path';

/* global process */


const app = express();
const __dirname = path.resolve();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//const app = express();
const PORT = process.env.PORT || 4000;



app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRouter);

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
  console.log(`Backend server listening on port ${PORT}`);
});
