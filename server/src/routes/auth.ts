import express from 'express';
import { register, login, getCurrentUser } from '../controllers/auth';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Register a new user
router.post('/register', register);

// Login
router.post('/login', login);

// Get current user (protected route)
router.get('/me', authenticate, getCurrentUser);

export default router; 