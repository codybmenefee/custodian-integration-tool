import { useToast } from '../ui/chakra-adapter';
import { isOnline } from './globalErrorHandler';

interface ApiError extends Error {
  statusCode?: number;
  data?: unknown;
  retryable?: boolean;
}

// Track API request counts for rate limiting
interface RateLimitTracker {
  [endpoint: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitTracker: RateLimitTracker = {};
const DEFAULT_RATE_LIMIT = 50; // requests per minute
const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds

/**
 * Creates a formatted error from API response
 * @param response The response from the API
 * @returns A formatted error with additional context
 */
export async function createApiError(response: Response): Promise<ApiError> {
  let errorData;
  try {
    errorData = await response.json();
  } catch {
    errorData = null;
  }

  const error = new Error(
    errorData?.message || response.statusText || 'Unknown error'
  ) as ApiError;
  
  error.statusCode = response.status;
  error.data = errorData;
  
  // Determine if the error is potentially retryable
  error.retryable = isErrorRetryable(response.status);
  
  return error;
}

/**
 * Determines if an error should be retried based on status code
 * @param statusCode The HTTP status code
 * @returns True if the error is retryable
 */
export function isErrorRetryable(statusCode: number): boolean {
  // 5xx errors are server errors and potentially retryable
  // 408 is Request Timeout
  // 429 is Too Many Requests
  return (
    statusCode >= 500 || 
    statusCode === 408 || 
    statusCode === 429
  );
}

/**
 * Handles API request errors consistently across the application
 * @param error The error to handle
 * @param fallbackMessage An optional fallback message if the error doesn't have one
 */
export function handleApiError(error: unknown, fallbackMessage = 'An error occurred while processing your request'): void {
  console.error('API Error:', error);
  
  const toast = useToast();
  const errorMessage = error instanceof Error 
    ? error.message 
    : typeof error === 'string'
      ? error
      : fallbackMessage;

  toast({
    title: 'Error',
    description: errorMessage,
    status: 'error',
    duration: 5000,
    isClosable: true,
  });
}

/**
 * Custom hook for handling API errors with toast notifications
 * @returns A function to handle API errors
 */
export function useApiErrorHandler() {
  const toast = useToast();
  
  return (error: unknown, fallbackMessage = 'An error occurred while processing your request') => {
    console.error('API Error:', error);
    
    // Handle network connectivity issues
    if (!isOnline()) {
      toast({
        title: 'Connectivity Error',
        description: 'You appear to be offline. Please check your internet connection and try again.',
        status: 'warning',
        duration: 7000,
        isClosable: true,
      });
      return;
    }
    
    // Format error message
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string'
        ? error
        : fallbackMessage;

    // Handle rate limiting errors specially
    const apiError = error as ApiError;
    if (apiError.statusCode === 429) {
      toast({
        title: 'Rate Limited',
        description: 'Too many requests. Please try again later.',
        status: 'warning',
        duration: 7000,
        isClosable: true,
      });
      return;
    }

    toast({
      title: 'Error',
      description: errorMessage,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  };
}

/**
 * Options for fetch with retry
 */
export interface FetchWithRetryOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  retryBackoffFactor?: number;
  timeout?: number;
  rateLimit?: number;
}

/**
 * Check if an endpoint is rate limited
 * @param endpoint The API endpoint
 * @param limit Maximum requests per minute
 * @returns True if rate limited
 */
function isRateLimited(endpoint: string, limit: number = DEFAULT_RATE_LIMIT): boolean {
  const now = Date.now();
  const key = endpoint.split('?')[0]; // Ignore query params for rate limiting
  
  // Initialize if first request
  if (!rateLimitTracker[key]) {
    rateLimitTracker[key] = {
      count: 0,
      resetTime: now + RATE_LIMIT_WINDOW
    };
  }
  
  // Reset counter if window expired
  if (now > rateLimitTracker[key].resetTime) {
    rateLimitTracker[key] = {
      count: 0,
      resetTime: now + RATE_LIMIT_WINDOW
    };
  }
  
  // Increment counter
  rateLimitTracker[key].count++;
  
  // Check if over limit
  return rateLimitTracker[key].count > limit;
}

/**
 * A wrapper for fetch that handles common error cases and includes retry logic
 * @param input The URL or Request object
 * @param options The request options including retry configuration
 * @returns A promise that resolves to the response data
 */
export async function fetchWithErrorHandling<T>(
  input: RequestInfo | URL,
  options?: FetchWithRetryOptions
): Promise<T> {
  // Get URL as string for rate limiting
  const url = typeof input === 'string' 
    ? input 
    : input instanceof URL 
      ? input.toString() 
      : input.url;
  
  const opts = options || {};
  
  // Extract retry options
  const retries = opts.retries !== undefined ? opts.retries : 3;
  const retryDelay = opts.retryDelay !== undefined ? opts.retryDelay : 300;
  const retryBackoffFactor = opts.retryBackoffFactor !== undefined ? opts.retryBackoffFactor : 2;
  const timeout = opts.timeout || 30000;
  const rateLimit = opts.rateLimit || DEFAULT_RATE_LIMIT;
  
  // Remove custom options before passing to fetch
  const fetchOptions: RequestInit = {...opts};
  delete (fetchOptions as any).retries;
  delete (fetchOptions as any).retryDelay;
  delete (fetchOptions as any).retryBackoffFactor;
  delete (fetchOptions as any).timeout;
  delete (fetchOptions as any).rateLimit;
  
  // Check network connectivity
  if (!isOnline()) {
    throw new Error('No internet connection available. Please check your network settings.');
  }
  
  // Check rate limiting
  if (isRateLimited(url, rateLimit)) {
    const error = new Error('Too many requests. Please try again later.') as ApiError;
    error.statusCode = 429;
    error.retryable = true;
    throw error;
  }
  
  // Implement retry logic
  let lastError: Error | null = null;
  let delay = retryDelay;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create an AbortController to handle timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      // Add signal to options
      const optionsWithSignal = {
        ...fetchOptions,
        signal: controller.signal
      };
      
      const response = await fetch(input, optionsWithSignal);
      
      // Clear timeout
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const error = await createApiError(response);
        
        // Only retry if the error is retryable and we have attempts left
        if (error.retryable && attempt < retries) {
          lastError = error;
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= retryBackoffFactor; // Increase delay for next attempt
          continue;
        }
        
        throw error;
      }
      
      return await response.json();
    } catch (error: unknown) {
      // Handle abort errors from timeout
      if (error instanceof DOMException && error.name === 'AbortError') {
        const timeoutError = new Error(`Request timed out after ${timeout}ms`) as ApiError;
        timeoutError.retryable = true;
        lastError = timeoutError;
      } else {
        lastError = error instanceof Error ? error : new Error('An unexpected error occurred');
      }
      
      // For network errors or timeouts, retry if we have attempts left
      const apiError = error as ApiError;
      const isNetworkError = error instanceof Error && !apiError.statusCode && isOnline();
      if ((isNetworkError || apiError.retryable) && attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= retryBackoffFactor;
        continue;
      }
      
      throw lastError;
    }
  }
  
  // This should never be reached, but TS requires a return
  throw lastError || new Error('Failed after maximum retries');
}

/**
 * Decorator function to add retry logic to any async function
 * @param fn The function to wrap with retry logic
 * @param options Retry options
 * @returns A function with retry capability
 */
export function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    retries?: number;
    retryDelay?: number;
    retryBackoffFactor?: number;
    shouldRetry?: (error: any) => boolean;
  } = {}
): T {
  const retries = options.retries ?? 3;
  const retryDelay = options.retryDelay ?? 300;
  const retryBackoffFactor = options.retryBackoffFactor ?? 2;
  const shouldRetry = options.shouldRetry ?? ((error: unknown) => {
    // By default, retry network errors and server errors
    const apiError = error as ApiError;
    return (error instanceof Error && !apiError.statusCode && isOnline()) || 
      (apiError.statusCode && apiError.statusCode >= 500);
  });
  
  return (async (...args: Parameters<T>) => {
    let lastError: any;
    let delay = retryDelay;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error;
        
        if (shouldRetry(error) && attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= retryBackoffFactor;
          continue;
        }
        
        throw error;
      }
    }
    
    throw lastError;
  }) as T;
} 