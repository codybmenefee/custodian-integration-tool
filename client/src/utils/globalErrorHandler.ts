/**
 * Global error handler for unhandled exceptions and rejections
 * Integrated with error monitoring services like Sentry
 */

// Import Sentry types if available, otherwise define minimal needed types
interface SentryEvent {
  user?: {
    ip_address?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface SentryBreadcrumbOptions {
  category: string;
  message: string;
  level: 'info' | 'warning' | 'error' | 'fatal';
  [key: string]: any;
}

interface SentryInitOptions {
  dsn?: string;
  environment?: string;
  tracesSampleRate?: number;
  replaysSessionSampleRate?: number;
  replaysOnErrorSampleRate?: number;
  beforeSend?: (event: SentryEvent) => SentryEvent | null;
  [key: string]: any;
}

// Define a minimal Sentry interface for our usage
interface SentryApi {
  init(options: SentryInitOptions): void;
  captureException(error: Error, options?: Record<string, any>): string;
  captureEvent(event: SentryEvent): string;
  addBreadcrumb(breadcrumb: SentryBreadcrumbOptions): void;
}

// Type for error handler function
type ErrorHandler = (error: Error, info?: string) => void;

// Available handlers
const handlers: ErrorHandler[] = [];

/**
 * Initialize global error handlers for the application
 * Should be called once at application startup
 */
export function initializeGlobalErrorHandlers(): void {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
    
    handleGlobalError(error, 'Unhandled Promise Rejection');
  });

  // Handle uncaught exceptions
  window.addEventListener('error', (event: ErrorEvent) => {
    handleGlobalError(event.error || new Error(event.message), 'Uncaught Exception');
    
    // Prevent default browser error handling
    event.preventDefault();
  });

  // Log initialization
  console.info('Global error handlers initialized');
}

/**
 * Handle a global error by passing it to all registered handlers
 * @param error The error object
 * @param info Additional information about the error context
 */
export function handleGlobalError(error: Error, info: string): void {
  console.error(`Global Error (${info}):`, error);
  
  // Call all registered handlers
  handlers.forEach(handler => {
    try {
      handler(error, info);
    } catch (handlerError) {
      // Don't let handler errors crash the application
      console.error('Error in error handler:', handlerError);
    }
  });
}

// Expose the handleGlobalError function for testing
if (process.env.NODE_ENV === 'test') {
  (globalThis as any).__test_handleGlobalError = handleGlobalError;
}

/**
 * Register a new error handler to process global errors
 * @param handler The handler function to register
 * @returns A function to unregister the handler
 */
export function registerGlobalErrorHandler(handler: ErrorHandler): () => void {
  handlers.push(handler);
  
  // Return function to unregister the handler
  return () => {
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  };
}

/**
 * Check if the application is currently online
 * @returns True if the application has network connectivity
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

/**
 * Monitor network connectivity and trigger handlers when status changes
 * @param onOffline Function to call when app goes offline
 * @param onOnline Function to call when app comes back online
 * @returns Function to stop monitoring
 */
export function monitorNetworkConnectivity(
  onOffline?: () => void,
  onOnline?: () => void
): () => void {
  const handleOffline = () => {
    console.warn('Network connection lost');
    if (onOffline) onOffline();
  };
  
  const handleOnline = () => {
    console.info('Network connection restored');
    if (onOnline) onOnline();
  };
  
  window.addEventListener('offline', handleOffline);
  window.addEventListener('online', handleOnline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('offline', handleOffline);
    window.removeEventListener('online', handleOnline);
  };
}

// Store errors when offline to send when back online
interface QueuedError {
  error: SentryEvent;
  timestamp: number;
}

const errorQueue: QueuedError[] = [];

/**
 * Add an error to the offline queue
 * @param error The error event to queue
 */
function addToErrorQueue(error: SentryEvent): void {
  errorQueue.push({
    error,
    timestamp: Date.now()
  });
  
  // Cap the queue size to prevent memory issues
  if (errorQueue.length > 100) {
    errorQueue.shift();
  }
  
  // Persist queue to localStorage if available
  try {
    localStorage.setItem('errorQueue', JSON.stringify(errorQueue));
  } catch (e) {
    console.error('Failed to persist error queue:', e);
  }
}

/**
 * Process queued errors when back online
 */
function processErrorQueue(): void {
  if (errorQueue.length === 0) return;
  
  // Load Sentry dynamically
  loadSentry().then(Sentry => {
    console.info(`Processing ${errorQueue.length} queued errors`);
    
    // Process errors with rate limiting
    const processNext = (index = 0) => {
      if (index >= errorQueue.length) {
        // All processed, clear queue
        errorQueue.length = 0;
        try {
          localStorage.removeItem('errorQueue');
        } catch (e) {
          console.error('Failed to clear error queue from storage:', e);
        }
        return;
      }
      
      const { error } = errorQueue[index];
      Sentry.captureEvent(error);
      
      // Process next with slight delay to avoid overwhelming the API
      setTimeout(() => processNext(index + 1), 100);
    };
    
    processNext();
  }).catch(err => {
    console.error('Failed to process error queue:', err);
  });
}

/**
 * Load queued errors from localStorage on startup
 */
export function loadQueuedErrors(): void {
  try {
    const storedQueue = localStorage.getItem('errorQueue');
    if (storedQueue) {
      const parsedQueue = JSON.parse(storedQueue);
      errorQueue.push(...parsedQueue);
      console.info(`Loaded ${parsedQueue.length} errors from queue`);
    }
  } catch (e) {
    console.error('Failed to load error queue:', e);
  }
}

/**
 * Dynamically load Sentry to avoid bundling it unnecessarily
 * @returns A promise that resolves to the Sentry API
 */
async function loadSentry(): Promise<SentryApi> {
  try {
    const Sentry = await import('@sentry/browser');
    return Sentry as unknown as SentryApi;
  } catch (error) {
    console.error('Failed to load Sentry:', error);
    throw error;
  }
}

/**
 * Integration with Sentry error monitoring service
 */
export function initializeErrorMonitoring(): void {
  // Skip in development or test environments if desired
  if (process.env.NODE_ENV === 'development' && !process.env.ENABLE_ERROR_MONITORING_IN_DEV) {
    console.info('Error monitoring disabled in development mode');
    return;
  }
  
  // Load Sentry dynamically
  loadSentry().then(Sentry => {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
      // Only capture a percentage of sessions in production for performance
      replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      // But always capture sessions with errors
      replaysOnErrorSampleRate: 1.0,
      // Add more context to errors
      beforeSend(event) {
        // Don't send events when offline
        if (!isOnline()) {
          // Queue the event for later sending
          addToErrorQueue(event);
          return null;
        }
        
        // Add additional context
        if (event.user) {
          // Anonymize user IPs in certain environments
          if (process.env.ANONYMIZE_IPS) {
            event.user.ip_address = '0.0.0.0';
          }
        }
        
        return event;
      }
    });
    
    // Register a global handler that reports to Sentry
    registerGlobalErrorHandler((error, info) => {
      Sentry.captureException(error, {
        extra: { info }
      });
    });

    // Set up network connectivity monitoring
    monitorNetworkConnectivity(
      // When going offline, use a breadcrumb
      () => {
        Sentry.addBreadcrumb({
          category: 'network',
          message: 'Network connectivity lost',
          level: 'warning'
        });
      },
      // When coming back online, send queued errors
      () => {
        Sentry.addBreadcrumb({
          category: 'network',
          message: 'Network connectivity restored',
          level: 'info'
        });
        processErrorQueue();
      }
    );
    
    console.info('Sentry error monitoring initialized');
  }).catch(err => {
    console.error('Failed to initialize Sentry:', err);
  });
} 