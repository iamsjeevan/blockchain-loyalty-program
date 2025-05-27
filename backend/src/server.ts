import express, { Request, Response, Application } from 'express';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config(); // This will load from 'backend/.env'

const app: Application = express();
const port = process.env.PORT || 3001;

// Middleware to parse JSON bodies
app.use(express.json());

// Simple test route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', message: 'Backend is healthy!' });
});

// TODO: Add routes for loyalty program (users, points, rewards)

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
