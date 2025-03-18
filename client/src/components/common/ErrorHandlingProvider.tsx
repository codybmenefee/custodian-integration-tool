import React, { useEffect } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { initializeGlobalErrorHandlers, initializeErrorMonitoring, loadQueuedErrors, monitorNetworkConnectivity } from '../../utils/globalErrorHandler';

interface ErrorHandlingProviderProps {
  children: React.ReactNode;
}

/**
 * ErrorHandlingProvider is a component that wraps the application with error handling functionality
 * It initializes global error handlers, Sentry integration, and network monitoring
 */
export const ErrorHandlingProvider: React.FC<ErrorHandlingProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize global error handlers
    initializeGlobalErrorHandlers();
    
    // Initialize error monitoring (Sentry)
    initializeErrorMonitoring();
    
    // Load any queued errors from previous sessions
    loadQueuedErrors();
    
    // Set up network connectivity monitoring
    const unsubscribeNetworkMonitoring = monitorNetworkConnectivity(
      // When going offline
      () => {
        // Show a notification to the user if needed
        console.warn('Application is offline. Some features may be unavailable.');
      },
      // When coming back online
      () => {
        console.info('Application is back online. Reconnecting...');
        // Retry any pending operations if needed
      }
    );
    
    // Clean up on unmount
    return () => {
      unsubscribeNetworkMonitoring();
    };
  }, []);
  
  return (
    <ErrorBoundary
      fallback={
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ color: '#e53e3e', fontSize: '24px', marginBottom: '16px' }}>
            Something went wrong
          </h1>
          <p style={{ marginBottom: '16px' }}>
            We're sorry, but an error occurred in the application.
            Our team has been notified and is working to fix the issue.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#3182ce',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            Reload Application
          </button>
        </div>
      }
      errorHandler={(error, errorInfo) => {
        // Log to console for development
        console.error('Root error boundary caught an error:', error, errorInfo);
        
        // You could send this error to your monitoring service here if not already
        // handled by global error handlers
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * Higher-order component to wrap the entire application with error handling
 * @param Component The component representing your application
 * @returns The component wrapped with error handling
 */
export function withErrorHandling<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  const WithErrorHandling: React.FC<P> = (props) => {
    return (
      <ErrorHandlingProvider>
        <Component {...props} />
      </ErrorHandlingProvider>
    );
  };
  
  const displayName = Component.displayName || Component.name || 'Component';
  WithErrorHandling.displayName = `withErrorHandling(${displayName})`;
  
  return WithErrorHandling;
} 