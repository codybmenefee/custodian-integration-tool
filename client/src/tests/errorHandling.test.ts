import { createApiError, fetchWithErrorHandling } from '../utils/errorHandling';

// Mock global fetch
global.fetch = jest.fn();

describe('createApiError', () => {
  test('creates error from JSON response', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: jest.fn().mockResolvedValue({ 
        message: 'Resource not found',
        details: 'The requested item does not exist'
      })
    };
    
    const error = await createApiError(mockResponse as unknown as Response);
    
    expect(error.message).toBe('Resource not found');
    expect(error.statusCode).toBe(404);
    expect(error.data).toEqual({ 
      message: 'Resource not found',
      details: 'The requested item does not exist'
    });
  });
  
  test('creates error when response JSON fails', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
    };
    
    const error = await createApiError(mockResponse as unknown as Response);
    
    expect(error.message).toBe('Internal Server Error');
    expect(error.statusCode).toBe(500);
    expect(error.data).toBeNull();
  });
  
  test('uses statusText when no message in response', async () => {
    const mockResponse = {
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      json: jest.fn().mockResolvedValue({ 
        code: 'ACCESS_DENIED'
      })
    };
    
    const error = await createApiError(mockResponse as unknown as Response);
    
    expect(error.message).toBe('Forbidden');
    expect(error.statusCode).toBe(403);
  });
  
  test('uses fallback for unknown errors', async () => {
    const mockResponse = {
      ok: false,
      status: 0,
      statusText: '',
      json: jest.fn().mockResolvedValue(null)
    };
    
    const error = await createApiError(mockResponse as unknown as Response);
    
    expect(error.message).toBe('Unknown error');
    expect(error.statusCode).toBe(0);
  });
});

describe('fetchWithErrorHandling', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });
  
  test('returns data for successful response', async () => {
    const responseData = { id: 1, name: 'Test Item' };
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(responseData)
    });
    
    const result = await fetchWithErrorHandling('/api/items/1');
    
    expect(result).toEqual(responseData);
    expect(global.fetch).toHaveBeenCalledWith('/api/items/1', undefined);
  });
  
  test('throws formatted error for failed response', async () => {
    const errorData = { message: 'Item not found' };
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: jest.fn().mockResolvedValueOnce(errorData)
    });
    
    await expect(fetchWithErrorHandling('/api/items/999')).rejects.toThrow('Item not found');
    expect(global.fetch).toHaveBeenCalledWith('/api/items/999', undefined);
  });
  
  test('passes request options to fetch', async () => {
    const responseData = { success: true };
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Item' })
    };
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(responseData)
    });
    
    await fetchWithErrorHandling('/api/items', requestOptions);
    
    expect(global.fetch).toHaveBeenCalledWith('/api/items', requestOptions);
  });
  
  test('handles network errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    
    await expect(fetchWithErrorHandling('/api/items')).rejects.toThrow('Network error');
  });
  
  test('wraps non-Error exceptions', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce('Something went wrong');
    
    await expect(fetchWithErrorHandling('/api/items')).rejects.toThrow('An unexpected error occurred during the request');
  });
}); 