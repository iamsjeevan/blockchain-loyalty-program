import express, { Request, Response, Application, NextFunction } from 'express'; // Added NextFunction
import dotenv from 'dotenv';
import { authenticateUser } from './middleware/authMiddleware';
import coffeeCoinRoutes from './routes/coffeeCoinRoutes';

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', message: 'Backend is healthy!' });
});

app.use('/api/coffee-coin', coffeeCoinRoutes);

// The authenticateUser middleware is async, but the final handler is sync. This is usually fine.
// The key is that authenticateUser itself must correctly match the expected middleware signature.
app.get('/api/user/me', authenticateUser, (req: Request, res: Response) => {
  if (req.user) { // req.user is populated by authenticateUser middleware
    res.status(200).json({
      message: 'Successfully authenticated!',
      privyDid: req.user.privyDid,
      wallet: req.user.wallet,
    });
  } else {
    // This case should ideally not be reached if middleware correctly handles errors
    // or calls next() only on success.
    // However, if authenticateUser calls next() even after an issue where req.user isn't set,
    // this block might be hit. The middleware should ideally send error response itself.
    res.status(401).json({ error: 'User not authenticated or user data unavailable' });
  }
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
  setTimeout(() => {
    require('./services/blockchainService');
  }, 100);
});