import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes.js';
dotenv.config();
const app = express();

// Logging middleware
app.use(morgan('dev'));
app.set("trust proxy", 1);

// CORS middleware
app.use(cors({
  origin: 'https://final-pro-pink.vercel.app',
  credentials: true,
  httpOnly: false,
  optionSuccessStatus: 200,
  sameSite: 'None',
  secure: true,
  methods: 'GET, POST, PUT, DELETE', // Specify the allowed HTTP methods
  allowedHeaders: 'Content-Type, Authorization',
  cookie: {
    secure: true,
    sameSite: 'None',
  }
}));

app.use(cookieParser());
app.use(express.json());  // Add this line to parse JSON requests

app.use('/api/v1/user', userRoutes);
// Server Status Check Route
app.get('/ping', (_req, res) => {
  res.send('Pong');
});

app.all('*', (req, res) => {
    res.status(404).send('OOPS!! 404 Page Not Found');
  });

  export default app;