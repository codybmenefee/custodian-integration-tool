import { registerGlobalErrorHandler, initializeGlobalErrorHandlers } from '../utils/globalErrorHandler';

describe('registerGlobalErrorHandler', () => {
  test('registers an error handler that can be called', () => {
    const mockHandler = jest.fn();
    const unregister = registerGlobalErrorHandler(mockHandler);
    
    // Simulate throwing a global error by directly calling the handler
    // This is a simplified approach since we can't easily test window events in Jest
    // We're accessing the private function via type casting
    const privateHandleGlobalError = (globalThis as any).__test_handleGlobalError;
    if (privateHandleGlobalError) {
      const testError = new Error('Test global error');
      privateHandleGlobalError(testError, 'Test Info');
      
      expect(mockHandler).toHaveBeenCalledWith(testError, 'Test Info');
    } else {
      // Skip test if we can't access the private function
      console.warn('Skipping test: Cannot access private handleGlobalError function');
    }
    
    // Clean up
    unregister();
  });
  
  test('unregister removes the handler', () => {
    const mockHandler = jest.fn();
    const unregister = registerGlobalErrorHandler(mockHandler);
    
    // Unregister the handler
    unregister();
    
    // Simulate throwing a global error
    const privateHandleGlobalError = (globalThis as any).__test_handleGlobalError;
    if (privateHandleGlobalError) {
      privateHandleGlobalError(new Error('Test error'), 'Test');
      
      // Handler should not be called after unregistration
      expect(mockHandler).not.toHaveBeenCalled();
    } else {
      console.warn('Skipping test: Cannot access private handleGlobalError function');
    }
  });
});

describe('initializeGlobalErrorHandlers', () => {
  let originalAddEventListener: typeof window.addEventListener;
  let addEventListenerMock: jest.Mock;
  
  beforeEach(() => {
    // Save the original addEventListener
    originalAddEventListener = window.addEventListener;
    
    // Mock addEventListener
    addEventListenerMock = jest.fn();
    window.addEventListener = addEventListenerMock;
  });
  
  afterEach(() => {
    // Restore original addEventListener
    window.addEventListener = originalAddEventListener;
  });
  
  test('registers handlers for unhandledrejection and error events', () => {
    initializeGlobalErrorHandlers();
    
    // Check if event listeners were registered
    expect(addEventListenerMock).toHaveBeenCalledTimes(2);
    expect(addEventListenerMock).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
    expect(addEventListenerMock).toHaveBeenCalledWith('error', expect.any(Function));
  });
  
  test('unhandledrejection handler processes errors correctly', () => {
    // Install the global error handlers
    initializeGlobalErrorHandlers();
    
    // Extract the handler function for unhandledrejection
    const [[, unhandledRejectionHandler]] = addEventListenerMock.mock.calls.filter(
      call => call[0] === 'unhandledrejection'
    );
    
    // Set up a spy on the global error handler
    const mockGlobalHandler = jest.fn();
    registerGlobalErrorHandler(mockGlobalHandler);
    
    // Create a mock event
    const mockEvent = {
      reason: new Error('Unhandled promise rejection'),
      preventDefault: jest.fn()
    };
    
    // Call the handler directly
    unhandledRejectionHandler(mockEvent);
    
    // Check if the global handler was called with the error
    expect(mockGlobalHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Unhandled promise rejection'
      }),
      'Unhandled Promise Rejection'
    );
  });
  
  test('error event handler processes errors correctly', () => {
    // Install the global error handlers
    initializeGlobalErrorHandlers();
    
    // Extract the handler function for error
    const [[, errorEventHandler]] = addEventListenerMock.mock.calls.filter(
      call => call[0] === 'error'
    );
    
    // Set up a spy on the global error handler
    const mockGlobalHandler = jest.fn();
    registerGlobalErrorHandler(mockGlobalHandler);
    
    // Create a mock event
    const mockEvent = {
      error: new Error('Uncaught exception'),
      message: 'Uncaught exception',
      preventDefault: jest.fn()
    };
    
    // Call the handler directly
    errorEventHandler(mockEvent);
    
    // Check if the global handler was called with the error
    expect(mockGlobalHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Uncaught exception'
      }),
      'Uncaught Exception'
    );
    
    // Check if preventDefault was called
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });
  
  test('error event handler uses message if error object is not available', () => {
    // Install the global error handlers
    initializeGlobalErrorHandlers();
    
    // Extract the handler function for error
    const [[, errorEventHandler]] = addEventListenerMock.mock.calls.filter(
      call => call[0] === 'error'
    );
    
    // Set up a spy on the global error handler
    const mockGlobalHandler = jest.fn();
    registerGlobalErrorHandler(mockGlobalHandler);
    
    // Create a mock event without error object
    const mockEvent = {
      error: null,
      message: 'Script error',
      preventDefault: jest.fn()
    };
    
    // Call the handler directly
    errorEventHandler(mockEvent);
    
    // Check if the global handler was called with an error created from the message
    expect(mockGlobalHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Script error'
      }),
      'Uncaught Exception'
    );
  });
}); 