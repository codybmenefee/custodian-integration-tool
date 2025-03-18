import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorBoundary, withErrorBoundary, useErrorHandler } from '../components/common/ErrorBoundary';

// Define interface for component props
interface ErrorThrowingComponentProps {
  shouldThrow?: boolean;
}

// Mock component that throws an error
const ErrorThrowingComponent: React.FC<ErrorThrowingComponentProps> = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div data-testid="normal-component">No error</div>;
};

// Mock for console.error to prevent test output pollution
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundary', () => {
  test('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('normal-component')).toBeInTheDocument();
  });
  
  test('renders fallback UI when error occurs', () => {
    // We need to spy on console.error for React's error boundary testing
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Verify fallback UI is shown
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    
    // Cleanup
    consoleSpy.mockRestore();
  });
  
  test('custom fallback is rendered when provided', () => {
    const customFallback = <div data-testid="custom-fallback">Custom Error UI</div>;
    
    render(
      <ErrorBoundary fallback={customFallback}>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
  });
  
  test('custom error handler is called when provided', () => {
    const errorHandler = jest.fn();
    
    render(
      <ErrorBoundary errorHandler={errorHandler}>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(errorHandler).toHaveBeenCalledTimes(1);
    expect(errorHandler.mock.calls[0][0].message).toBe('Test error');
  });
  
  test('reset functionality works', async () => {
    const onReset = jest.fn();
    
    render(
      <ErrorBoundary onReset={onReset}>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Click the Try Again button
    fireEvent.click(screen.getByText('Try Again'));
    
    // Check if onReset was called
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});

describe('withErrorBoundary HOC', () => {
  test('wraps component with ErrorBoundary', () => {
    const WrappedComponent = withErrorBoundary(ErrorThrowingComponent);
    
    render(<WrappedComponent shouldThrow={false} />);
    
    expect(screen.getByTestId('normal-component')).toBeInTheDocument();
  });
  
  test('handles errors in wrapped component', () => {
    const WrappedComponent = withErrorBoundary(ErrorThrowingComponent);
    
    render(<WrappedComponent shouldThrow={true} />);
    
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
  });
  
  test('passes props to ErrorBoundary', () => {
    const errorHandler = jest.fn();
    const WrappedComponent = withErrorBoundary(ErrorThrowingComponent, { errorHandler });
    
    render(<WrappedComponent shouldThrow={true} />);
    
    expect(errorHandler).toHaveBeenCalledTimes(1);
  });
});

// Test useErrorHandler hook
describe('useErrorHandler hook', () => {
  // We need to create a component that uses the hook
  const AsyncErrorComponent = () => {
    const throwError = useErrorHandler();
    
    const triggerAsyncError = () => {
      throwError(new Error('Async error'));
    };
    
    return (
      <button onClick={triggerAsyncError} data-testid="async-error-button">
        Trigger Async Error
      </button>
    );
  };
  
  test('propagates errors to ErrorBoundary', async () => {
    render(
      <ErrorBoundary>
        <AsyncErrorComponent />
      </ErrorBoundary>
    );
    
    // Click button to trigger error
    fireEvent.click(screen.getByTestId('async-error-button'));
    
    // Wait for error boundary to catch the error
    await waitFor(() => {
      expect(screen.getByText('An error occurred')).toBeInTheDocument();
      expect(screen.getByText('Async error')).toBeInTheDocument();
    });
  });
}); 