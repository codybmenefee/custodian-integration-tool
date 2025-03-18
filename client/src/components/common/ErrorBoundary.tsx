import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Heading, Text, Alert, AlertIcon, AlertTitle, AlertDescription, Stack } from '../../ui/chakra-adapter';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  errorHandler?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 * 
 * Features:
 * - Catches runtime errors in React components
 * - Provides meaningful error messages to users
 * - Logs errors for debugging
 * - Allows users to recover from errors when possible
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Update state with error info
    this.setState({
      errorInfo
    });
    
    // Call custom error handler if provided
    if (this.props.errorHandler) {
      this.props.errorHandler(error, errorInfo);
    }
  }

  handleReset = (): void => {
    // Reset the error boundary state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Call the onReset callback if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // If a custom fallback is provided, render it
      if (fallback) {
        return fallback;
      }

      // Otherwise render the default error UI
      return (
        <Box p={4} borderWidth="1px" borderRadius="md" bg="white">
          <Alert status="error">
            <AlertIcon />
            <Box>
              <AlertTitle>An error occurred</AlertTitle>
              <AlertDescription>
                The application encountered an unexpected error.
              </AlertDescription>
            </Box>
          </Alert>
          
          <Stack spacing={4} mt={4}>
            <Box>
              <Heading size="md" mb={2}>Error Details</Heading>
              <Text>{error?.message || 'Unknown error'}</Text>
            </Box>
            
            {process.env.NODE_ENV !== 'production' && errorInfo && (
              <Box>
                <Heading size="md" mb={2}>Component Stack</Heading>
                <Box 
                  as="pre" 
                  p={3} 
                  bg="gray.100" 
                  borderRadius="md" 
                  style={{ fontSize: "0.875rem", overflowX: "auto" }}
                >
                  {errorInfo.componentStack}
                </Box>
              </Box>
            )}
            
            <Box mt={4}>
              <Button colorScheme="blue" onClick={this.handleReset}>
                Try Again
              </Button>
            </Box>
          </Stack>
        </Box>
      );
    }

    // When there's no error, render children normally
    return children;
  }
}

/**
 * Higher-order component that wraps a component with an ErrorBoundary
 * @param Component The component to wrap
 * @param errorBoundaryProps Additional props to pass to the ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps: Omit<ErrorBoundaryProps, 'children'> = {}
): React.FC<P> {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const ComponentWithErrorBoundary: React.FC<P> = (props) => {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
  
  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;
  
  return ComponentWithErrorBoundary;
}

/**
 * Hook to create an error thrower function that can be used in async functions
 * Example usage: 
 * const throwError = useErrorHandler();
 * try {
 *   await fetchData();
 * } catch (error) {
 *   throwError(error);
 * }
 */
export function useErrorHandler(): (error: unknown) => void {
  const [error, setError] = React.useState<unknown>(null);
  
  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);
  
  return setError;
} 