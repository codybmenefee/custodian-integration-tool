import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';  // Add this import for toBeInTheDocument
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import SchemaComparison from '../components/schema/SchemaComparison';
import { Schema, SchemaComparison as SchemaComparisonType, FieldType } from 'shared/src/types';

// Mock the schema service
jest.mock('../services/schemaService', () => ({
  compareSchemaVersions: jest.fn(),
  getSchemaById: jest.fn(),
}));

// Mock the useSearchParams hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: () => [
    {
      get: (param: string) => {
        if (param === 'schema1') return 'schema1-id';
        if (param === 'schema2') return 'schema2-id';
        return null;
      },
    },
    jest.fn(),
  ],
}));

describe('SchemaComparison Component', () => {
  const mockSchema1: Schema = {
    id: 'schema1-id',
    name: 'Test Schema 1',
    version: '1.0.0',
    fields: [
      { name: 'field1', type: FieldType.STRING, required: true },
      { name: 'field2', type: FieldType.NUMBER, required: false },
    ],
    createdBy: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    isLatestVersion: true,
  };

  const mockSchema2: Schema = {
    id: 'schema2-id',
    name: 'Test Schema 1',
    version: '1.1.0',
    fields: [
      { name: 'field1', type: FieldType.STRING, required: true },
      { name: 'field3', type: FieldType.BOOLEAN, required: true },
    ],
    createdBy: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    isLatestVersion: true,
  };

  const mockComparison: SchemaComparisonType = {
    added: [{ name: 'field3', type: FieldType.BOOLEAN, required: true }],
    removed: [{ name: 'field2', type: FieldType.NUMBER, required: false }],
    modified: [],
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Set up the service mocks
    const schemaService = require('../services/schemaService');
    schemaService.getSchemaById.mockImplementation((id: string) => {
      if (id === 'schema1-id') return Promise.resolve(mockSchema1);
      if (id === 'schema2-id') return Promise.resolve(mockSchema2);
      return Promise.reject(new Error('Schema not found'));
    });
    
    schemaService.compareSchemaVersions.mockResolvedValue(mockComparison);
  });

  test('should render loading state initially', () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <MemoryRouter>
          <SchemaComparison />
        </MemoryRouter>
      </ChakraProvider>
    );
    
    expect(screen.getByText('Loading comparison...')).toBeInTheDocument();
  });

  test('should show schema comparison data when loaded', async () => {
    render(
      <ChakraProvider value={defaultSystem}>
        <MemoryRouter>
          <SchemaComparison />
        </MemoryRouter>
      </ChakraProvider>
    );
    
    // Wait for data to load
    expect(await screen.findByText('Schema Comparison')).toBeInTheDocument();
    expect(await screen.findByText('Test Schema 1 (v1.0.0)')).toBeInTheDocument();
    expect(await screen.findByText('Test Schema 1 (v1.1.0)')).toBeInTheDocument();
    
    // Check changes summary
    expect(await screen.findByText('Added Fields (1)')).toBeInTheDocument();
    expect(await screen.findByText('Removed Fields (1)')).toBeInTheDocument();
  });
}); 