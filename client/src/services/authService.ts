import axios from 'axios';
import { UserLoginRequest, UserRegistrationRequest, AuthResponse } from 'shared/src/types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_info';

/**
 * Register a new user
 */
export const register = async (userData: UserRegistrationRequest): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    const { token, user } = response.data;
    
    // Store auth data
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Login a user
 */
export const login = async (credentials: UserLoginRequest): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    const { token, user } = response.data;
    
    // Store auth data
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Logout the current user
 */
export const logout = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Get the stored auth token
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Get the current user from storage
 */
export const getCurrentUser = () => {
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch (error) {
    console.error('Error parsing user JSON:', error);
    return null;
  }
};

/**
 * Check if the user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
}; 