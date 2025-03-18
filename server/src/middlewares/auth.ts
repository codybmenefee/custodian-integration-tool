import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { User } from '../models/User';
import { UserRole } from 'shared/src/types';

// Extend Express Request type to include user
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      email: string;
      role: string;
    };
  }
}

/**
 * Middleware to authenticate requests using JWT
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Authentication token is missing' });
    }
    
    // Extract the token (Bearer <token>)
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Invalid authentication token format' });
    }
    
    // Verify the token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    // Check if the user exists
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Attach user info to request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

/**
 * Middleware to check if user has admin role
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
}; 