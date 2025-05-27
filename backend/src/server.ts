import express, { Request, Response, Application, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // <<<<<<<<<<<<<<<<<<<<<< 1. IMPORT CORS
import { authenticateUser } from './middleware/authMiddleware';
import coffeeCoinRoutes from './routes/coffeeCoinRoutes';

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3001;

// <<<<<<<<<<<<<<<<<<<<<< 2. USE CORS MIDDLEWARE *BEFORE* YOUR ROUTES
// This allows all origins. For development, this is usually fine.
// For production, you'd configure specific origins.
app.use(cors());

// Middleware to parse JSON bodies - should come after CORS generally,
// though order with cors() isn't usually critical unless cors() itself needs req.body.
app.use(express.json());


// --- Health Check ---
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', message: 'Backend is healthy!' });
});

// --- API Routes ---
app.use('/api/coffee-coin', coffeeCoinRoutes);

app.get('/api/user/me', authenticateUser, (req: Request, res: Response) => {
  if (req.user) {
    res.status(200).json({
      message: 'Successfully authenticated!',
      privyDid: req.user.privyDid,
      wallet: req.user.wallet,
    });
  } else {
    res.status(401).json({ error: 'User not authenticated or user data unavailable' });
  }
});


app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
  setTimeout(() => {
    // Ensure blockchainService is required here so it initializes after env is loaded
    // and potentially after other initial setups if there were any.
    require('./services/blockchainService');
  }, 100);
});