import api from './api';
import { User, UserLoginRequest, UserRegistrationRequest, AuthResponse } from 'shared/src/types';

// Token storage key
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/**
 * Register a new user
 */
export const register = async (data: UserRegistrationRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', data);
  
  // Store token and user info
  localStorage.setItem(TOKEN_KEY, response.data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
  
  return response.data;
};

/**
 * Login a user
 */
export const login = async (data: UserLoginRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  
  // Store token and user info
  localStorage.setItem(TOKEN_KEY, response.data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
  
  return response.data;
};

/**
 * Logout the current user
 */
export const logout = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Get the current user
 */
export const getCurrentUser = async (): Promise<Omit<User, 'password'> | null> => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (!token) {
      return null;
    }
    
    const response = await api.get<{ user: Omit<User, 'password'> }>('/auth/me');
    return response.data.user;
  } catch (error) {
    logout(); // Clear invalid token
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(TOKEN_KEY);
};

/**
 * Get stored user info
 */
export const getStoredUser = (): Omit<User, 'password'> | null => {
  const userJson = localStorage.getItem(USER_KEY);
  
  if (!userJson) {
    return null;
  }
  
  try {
    return JSON.parse(userJson);
  } catch (error) {
    return null;
  }
}; 