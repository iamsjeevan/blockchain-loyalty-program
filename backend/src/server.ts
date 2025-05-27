import express, { Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import { authenticateUser } from './middleware/authMiddleware';
import coffeeCoinRoutes from './routes/coffeeCoinRoutes'; // Import CoffeeCoin routes

// Load environment variables from .env file
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3001;

// Middleware to parse JSON bodies
app.use(express.json());

// --- Public Routes ---
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', message: 'Backend is healthy!' });
});

// --- CoffeeCoin Specific Routes (mostly public for now for reading data) ---
app.use('/api/coffee-coin', coffeeCoinRoutes);


// --- Protected Routes (require authentication) ---
app.get('/api/user/me', authenticateUser, (req: Request, res: Response) => {
  if (req.user) {
    res.status(200).json({
      message: 'Successfully authenticated!',
      privyDid: req.user.privyDid,
      wallet: req.user.wallet,
    });
  } else {
    res.status(401).json({ error: 'User not authenticated' });
  }
});


app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
  // A small delay to let blockchainService log its initialization
  setTimeout(() => {
    // This ensures that blockchainService attempts to initialize after server.ts starts.
    // In a more complex app, service initialization might be handled differently.
    require('./services/blockchainService');
  }, 100);
});
