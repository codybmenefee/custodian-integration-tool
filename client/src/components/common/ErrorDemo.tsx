import React, { useState } from 'react';
import { Box, Button, Stack, Text, Heading, Divider, Code, Alert, AlertIcon } from '../../ui/chakra-adapter';
import { ErrorBoundary, useErrorHandler, withErrorBoundary } from './ErrorBoundary';
import { useApiErrorHandler, withRetry } from '../../utils/errorHandling';
import { initializeErrorMonitoring, isOnline, monitorNetworkConnectivity } from '../../utils/globalErrorHandler';

// Define valid color schemes and status types
// These types match the ones from chakra-adapter.tsx and are used for Button and Alert components
type ColorScheme = 'blue' | 'red' | 'green' | 'orange' | 'purple' | 'gray';
type AlertStatus = 'info' | 'warning' | 'success' | 'error';

// Component that throws an error when rendered
const BuggyCounter: React.FC = () => {
  const [counter, setCounter] = useState(0);
  
  const handleIncrement = () => {
    setCounter(prevCount => prevCount + 1);
  };
  
  if (counter === 5) {
    // Simulate a render error when counter reaches 5
    throw new Error('I crashed when counter reached 5!');
  }
  
  return (
    <Box p={4} borderWidth="1px" borderRadius="md" bg="white">
      <Text mb={2}>Counter: {counter}</Text>
      <Button onClick={handleIncrement} colorScheme="blue" size="sm">
        Increment
      </Button>
    </Box>
  );
};

// Component that demonstrates the useErrorHandler hook
const AsyncErrorDemo: React.FC = () => {
  const throwError = useErrorHandler();
  const [loading, setLoading] = useState(false);
  
  const simulateAsyncError = async () => {
    setLoading(true);
    try {
      // Simulate an async operation that fails
      await new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error('Async operation failed!')), 1000);
      });
    } catch (error) {
      throwError(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box p={4} borderWidth="1px" borderRadius="md" bg="white">
      <Text mb={2}>Click to simulate an async error with useErrorHandler hook</Text>
      <Button 
        onClick={simulateAsyncError} 
        colorScheme="red" 
        size="sm"
        isLoading={loading}
      >
        Trigger Async Error
      </Button>
    </Box>
  );
};

// Component that demonstrates API error handling
const ApiErrorDemo: React.FC = () => {
  const handleApiError = useApiErrorHandler();
  const [loading, setLoading] = useState(false);
  
  const simulateApiError = async () => {
    setLoading(true);
    try {
      // Simulate a failed API call
      await new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error('API request failed with status 500')), 1000);
      });
    } catch (error) {
      handleApiError(error, 'Failed to fetch data from the API');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box p={4} borderWidth="1px" borderRadius="md" bg="white">
      <Text mb={2}>Click to simulate an API error with toast notification</Text>
      <Button 
        onClick={simulateApiError}
        colorScheme="orange" 
        size="sm"
        isLoading={loading}
      >
        Trigger API Error
      </Button>
    </Box>
  );
};

// Component that demonstrates API retry functionality
const RetryDemo: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Create a function that fails a few times then succeeds
  const fetchWithFailures = async (): Promise<string> => {
    const randomFailureCount = Math.floor(Math.random() * 5) + 1; // 1-5 failures
    
    // Store the current call count in a closure
    let callCount = 0;
    
    // Apply retry logic to a function that fails a few times
    const flakeyFunction = withRetry(async () => {
      callCount++;
      setStatus(`Attempt ${callCount}...`);
      
      // Fail for the first few attempts
      if (callCount <= randomFailureCount) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Delay for effect
        throw new Error(`Simulated failure on attempt ${callCount}`);
      }
      
      // Succeed on the final attempt
      return `Success after ${callCount} attempts!`;
    }, {
      retries: 5,
      retryDelay: 500,
      retryBackoffFactor: 1.5
    });
    
    return flakeyFunction();
  };
  
  const handleRetryDemo = async () => {
    setLoading(true);
    setStatus('Starting...');
    
    try {
      const result = await fetchWithFailures();
      setStatus(result);
    } catch (error) {
      setStatus(`Failed after all retries: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box p={4} borderWidth="1px" borderRadius="md" bg="white">
      <Text mb={2}>Demonstrates automatic retry for failing operations</Text>
      <Button 
        onClick={handleRetryDemo}
        colorScheme="blue" 
        size="sm"
        isLoading={loading}
        mb={2}
      >
        Test Retry Mechanism
      </Button>
      
      {status && (
        <Alert status={status.includes('Success') ? 'success' : 'info'}>
          <AlertIcon />
          {status}
        </Alert>
      )}
    </Box>
  );
};

// Component that demonstrates network connectivity checking
const NetworkConnectivityDemo: React.FC = () => {
  const [isOfflineSimulated, setIsOfflineSimulated] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<string>(`Current status: ${isOnline() ? 'Online' : 'Offline'}`);
  
  // Set up network monitoring on mount
  React.useEffect(() => {
    const unsubscribe = monitorNetworkConnectivity(
      // When going offline
      () => {
        setNetworkStatus('Network disconnected. Some features may be unavailable.');
      },
      // When coming back online
      () => {
        setNetworkStatus('Network connection restored!');
      }
    );
    
    // Cleanup on unmount
    return () => unsubscribe();
  }, []);
  
  const toggleOfflineSimulation = () => {
    setIsOfflineSimulated(!isOfflineSimulated);
    
    // This just updates the display, since we can't actually change navigator.onLine
    setNetworkStatus(`Simulating ${!isOfflineSimulated ? 'offline' : 'online'} mode. In a real app, we'd handle this case.`);
  };
  
  const testNetworkRequest = async () => {
    try {
      if (isOfflineSimulated) {
        throw new Error('Network request failed - you are offline');
      }
      
      setNetworkStatus('Network request succeeded!');
    } catch (error) {
      setNetworkStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  return (
    <Box p={4} borderWidth="1px" borderRadius="md" bg="white">
      <Text mb={2}>Network connectivity handling</Text>
      <Stack spacing={2}>
        <Alert status={isOfflineSimulated ? 'warning' : 'info'}>
          <AlertIcon />
          {networkStatus}
        </Alert>
        
        <Button 
          onClick={toggleOfflineSimulation}
          colorScheme={isOfflineSimulated ? 'red' : 'green'} 
          size="sm"
        >
          {isOfflineSimulated ? 'Simulate Online' : 'Simulate Offline'}
        </Button>
        
        <Button 
          onClick={testNetworkRequest}
          colorScheme="blue" 
          size="sm"
        >
          Test Network Request
        </Button>
      </Stack>
    </Box>
  );
};

// Creating a component with the HOC
const ComponentWithHOC: React.FC = () => {
  const [shouldError, setShouldError] = useState(false);
  
  if (shouldError) {
    throw new Error('Error triggered in HOC-wrapped component!');
  }
  
  return (
    <Box p={4} borderWidth="1px" borderRadius="md" bg="white">
      <Text mb={2}>This component is wrapped with withErrorBoundary HOC</Text>
      <Button onClick={() => setShouldError(true)} colorScheme="purple" size="sm">
        Trigger Error
      </Button>
    </Box>
  );
};

// Wrap the component with the HOC
const EnhancedComponentWithHOC = withErrorBoundary(ComponentWithHOC, {
  onReset: () => console.log('HOC error boundary reset'),
  errorHandler: (error) => console.error('HOC caught error:', error)
});

// Component for Sentry integration demo
const SentryDemo: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  
  const initializeSentry = () => {
    try {
      initializeErrorMonitoring();
      setStatus('Sentry has been initialized');
    } catch (error) {
      setStatus(`Error initializing Sentry: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  const triggerSentryError = () => {
    try {
      // This is a deliberate error to be caught by Sentry
      throw new Error('This is a test error for Sentry');
    } catch (error) {
      // Normally we would let this propagate to the global handler,
      // but for the demo we'll just show it was triggered
      setStatus('Test error triggered and sent to Sentry (if configured)');
    }
  };
  
  return (
    <Box p={4} borderWidth="1px" borderRadius="md" bg="white">
      <Text mb={2}>Sentry error monitoring integration</Text>
      <Stack spacing={2}>
        <Button 
          onClick={initializeSentry}
          colorScheme="blue" 
          size="sm"
        >
          Initialize Sentry
        </Button>
        
        <Button 
          onClick={triggerSentryError}
          colorScheme="red" 
          size="sm"
        >
          Trigger Test Error
        </Button>
        
        {status && (
          <Alert status="info">
            <AlertIcon />
            {status}
          </Alert>
        )}
      </Stack>
    </Box>
  );
};

// Code Block component
const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box 
      as="pre" 
      p={2} 
      mt={4} 
      borderRadius="md" 
      style={{ 
        display: "block", 
        whiteSpace: "pre",
        background: "#f0f0f0",
        overflowX: "auto"
      }}
    >
      <Code>{children}</Code>
    </Box>
  );
};

// Main Error Demo component
export const ErrorDemo: React.FC = () => {
  return (
    <Box width="100%" style={{ maxWidth: "800px", margin: "0 auto" }} p={8}>
      <Heading mb={4}>Error Handling Demonstrations</Heading>
      <Text mb={8}>
        This page demonstrates different ways to use the error handling system including
        ErrorBoundary, retry mechanisms, network handling, and Sentry integration.
      </Text>
      
      <Stack spacing={8}>
        <Box>
          <Heading size="md" mb={4}>1. Basic ErrorBoundary</Heading>
          <Text mb={4}>
            This counter will throw an error when it reaches 5. The ErrorBoundary 
            will catch it and display a fallback UI.
          </Text>
          <ErrorBoundary>
            <BuggyCounter />
          </ErrorBoundary>
          <CodeBlock>
{`<ErrorBoundary>
  <BuggyCounter />
</ErrorBoundary>`}
          </CodeBlock>
        </Box>
        
        <Divider />
        
        <Box>
          <Heading size="md" mb={4}>2. useErrorHandler Hook for Async Errors</Heading>
          <Text mb={4}>
            This demonstrates how to use the useErrorHandler hook to handle 
            asynchronous errors and propagate them to the ErrorBoundary.
          </Text>
          <ErrorBoundary>
            <AsyncErrorDemo />
          </ErrorBoundary>
          <CodeBlock>
{`const throwError = useErrorHandler();
try {
  await asyncOperation();
} catch (error) {
  throwError(error);
}`}
          </CodeBlock>
        </Box>
        
        <Divider />
        
        <Box>
          <Heading size="md" mb={4}>3. API Error Handling</Heading>
          <Text mb={4}>
            This demonstrates how to use the API error handling utilities to 
            display toast notifications for API errors.
          </Text>
          <ApiErrorDemo />
          <CodeBlock>
{`const handleApiError = useApiErrorHandler();
try {
  await fetchData();
} catch (error) {
  handleApiError(error, 'Failed to fetch data');
}`}
          </CodeBlock>
        </Box>
        
        <Divider />
        
        <Box>
          <Heading size="md" mb={4}>4. Automatic Retry Mechanism</Heading>
          <Text mb={4}>
            This demonstrates the retry mechanism for operations that might fail temporarily.
            It will automatically retry with exponential backoff delays.
          </Text>
          <RetryDemo />
          <CodeBlock>
{`// Add retry to any async function
const fetchWithRetry = withRetry(fetchData, {
  retries: 3,
  retryDelay: 300,
  retryBackoffFactor: 2
});

// Or use the enhanced fetch utility
const data = await fetchWithErrorHandling('/api/data', {
  retries: 3,
  retryDelay: 300
});`}
          </CodeBlock>
        </Box>
        
        <Divider />
        
        <Box>
          <Heading size="md" mb={4}>5. Network Connectivity Handling</Heading>
          <Text mb={4}>
            This demonstrates how the system handles network connectivity changes
            and provides utilities to check online status.
          </Text>
          <NetworkConnectivityDemo />
          <CodeBlock>
{`// Check if online
if (isOnline()) {
  // Perform network operation
}

// Monitor connectivity changes
const unsubscribe = monitorNetworkConnectivity(
  () => console.log('Offline now'),
  () => console.log('Back online')
);`}
          </CodeBlock>
        </Box>
        
        <Divider />
        
        <Box>
          <Heading size="md" mb={4}>6. withErrorBoundary HOC</Heading>
          <Text mb={4}>
            This demonstrates how to use the withErrorBoundary HOC to wrap 
            components that might throw errors.
          </Text>
          <EnhancedComponentWithHOC />
          <CodeBlock>
{`const EnhancedComponent = withErrorBoundary(YourComponent, {
  onReset: () => console.log('Error boundary reset'),
  errorHandler: (error) => console.error('Caught error:', error)
});`}
          </CodeBlock>
        </Box>
        
        <Divider />
        
        <Box>
          <Heading size="md" mb={4}>7. Sentry Integration</Heading>
          <Text mb={4}>
            This demonstrates the Sentry integration for error monitoring.
            Note that actual error reporting requires a Sentry account and configuration.
          </Text>
          <SentryDemo />
          <CodeBlock>
{`// Initialize in your app's entry point
initializeErrorMonitoring();

// Errors will be automatically captured by global handlers
// or you can manually capture them
try {
  riskyOperation();
} catch (error) {
  Sentry.captureException(error);
}`}
          </CodeBlock>
        </Box>
      </Stack>
    </Box>
  );
}; 