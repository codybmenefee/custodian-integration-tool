# Error Handling Components

This directory contains common components for handling errors in the application.

## ErrorBoundary

The `ErrorBoundary` component provides a way to catch JavaScript errors anywhere in a child component tree, log those errors, and display a fallback UI instead of the component tree that crashed.

### Features

- Catches runtime errors in React components
- Provides meaningful error messages to users
- Logs errors for debugging purposes
- Allows users to recover from errors when possible

### Basic Usage

Wrap any component that might throw an error:

```tsx
import { ErrorBoundary } from '../components/common/ErrorBoundary';

// In your component
return (
  <ErrorBoundary>
    <YourComponent />
  </ErrorBoundary>
);
```

### Advanced Usage

#### With Custom Fallback UI

```tsx
import { ErrorBoundary } from '../components/common/ErrorBoundary';

// Custom fallback UI
const fallbackUI = (
  <div>
    <h2>Something went wrong.</h2>
    <p>Please try again or contact support.</p>
  </div>
);

// In your component
return (
  <ErrorBoundary fallback={fallbackUI}>
    <YourComponent />
  </ErrorBoundary>
);
```

#### With Reset Functionality

```tsx
import { ErrorBoundary } from '../components/common/ErrorBoundary';

// In your component
const handleReset = () => {
  // Perform any cleanup or state resets here
  fetchDataAgain();
};

return (
  <ErrorBoundary onReset={handleReset}>
    <YourComponent />
  </ErrorBoundary>
);
```

#### With Custom Error Handling

```tsx
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { captureException } from '../utils/errorReporting';

// In your component
const handleError = (error, errorInfo) => {
  // Log error to a service like Sentry
  captureException(error, { extra: errorInfo });
};

return (
  <ErrorBoundary errorHandler={handleError}>
    <YourComponent />
  </ErrorBoundary>
);
```

### Using the HOC

For components that are used in multiple places, you can use the `withErrorBoundary` higher-order component:

```tsx
import { withErrorBoundary } from '../components/common/ErrorBoundary';

const YourComponent = () => {
  // Component code
};

// Wrap the component with error boundary
export default withErrorBoundary(YourComponent, {
  onReset: () => console.log('Error boundary reset'),
  errorHandler: (error, errorInfo) => console.error('Caught error:', error, errorInfo),
});
```

### Using the Error Handler Hook

For handling async errors or errors from API calls:

```tsx
import { useErrorHandler } from '../components/common/ErrorBoundary';

const YourComponent = () => {
  const throwError = useErrorHandler();
  
  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      return await response.json();
    } catch (error) {
      // This will propagate the error to the nearest ErrorBoundary
      throwError(error);
    }
  };
  
  // Component code
};
```

## API Error Handling

For API error handling, use the utilities in `utils/errorHandling.ts`:

```tsx
import { useApiErrorHandler, fetchWithErrorHandling } from '../utils/errorHandling';

const YourComponent = () => {
  const handleApiError = useApiErrorHandler();
  
  const fetchData = async () => {
    try {
      // Option 1: Use the fetch wrapper
      const data = await fetchWithErrorHandling('/api/data');
      
      // Option 2: Handle manually
      const response = await fetch('/api/other-data');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      return await response.json();
    } catch (error) {
      // This will display a toast with the error message
      handleApiError(error, 'Failed to fetch data');
    }
  };
  
  // Component code
};
```

## Best Practices

1. Place ErrorBoundaries strategically:
   - At the route level (already implemented in RouterAdapter)
   - Around critical feature components
   - Around third-party components that might throw errors

2. Always provide meaningful error messages to users

3. Log errors for debugging purposes

4. Provide a way for users to recover when possible (e.g., retry button)

5. Use the API error handling utilities for consistent error handling across the application 