import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserLoginRequest, UserRegistrationRequest, UserRole } from 'shared/src/types';
import * as authService from '../services/auth';

// Interface for auth context
interface AuthContextType {
  user: Omit<User, 'password'> | null;
  loading: boolean;
  error: string | null;
  login: (data: UserLoginRequest) => Promise<void>;
  register: (data: UserRegistrationRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Create a dummy user for automatic authentication
  const dummyUser: Omit<User, 'password'> = {
    id: 'demo-user-123',
    name: 'Demo User',
    email: 'demo@example.com',
    role: UserRole.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Initialize with the dummy user instead of null
  const [user, setUser] = useState<Omit<User, 'password'> | null>(dummyUser);
  const [loading, setLoading] = useState<boolean>(false); // Set loading to false initially
  const [error, setError] = useState<string | null>(null);

  // Skip the loadUser effect for the demo
  useEffect(() => {
    // We're already authenticated with the dummy user
    // No need to check localStorage or validate token
    setLoading(false);
  }, []);

  // Login function - automatically succeeds with dummy user
  const login = async (data: UserLoginRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      // Skip actual API call and set the dummy user
      setUser(dummyUser);
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err &&
        err.response && typeof err.response === 'object' && 
        'data' in err.response && err.response.data && 
        typeof err.response.data === 'object' && 
        'message' in err.response.data ? 
        (err.response.data.message as string) : 'Failed to login';
        
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function - automatically succeeds with dummy user
  const register = async (data: UserRegistrationRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      // Skip actual API call and set the dummy user
      setUser(dummyUser);
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err &&
        err.response && typeof err.response === 'object' && 
        'data' in err.response && err.response.data && 
        typeof err.response.data === 'object' && 
        'message' in err.response.data ? 
        (err.response.data.message as string) : 'Failed to register';
        
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Just for demo purposes, we'll re-authenticate immediately
    setUser(dummyUser);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 