import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SchemaComparison from '../components/schema/SchemaComparison';
import { Schema, SchemaComparison as SchemaComparisonType } from 'shared/src/types';
import * as schemaService from '../services/schemaService';

// Mock the schema service
jest.mock('../services/schemaService', () => ({
  getSchemaById: jest.fn(),
  compareSchemaVersions: jest.fn(),
}));

// Mock useSearchParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: () => [
    {
      get(param) {
        if (param === 'schema1') return 'schema1-id';
        if (param === 'schema2') return 'schema2-id';
        return null;
      },
    },
  ],
}));

describe('SchemaComparison Component with Adapter', () => {
  const mockSchema1 = {
    id: 'schema1-id',
    name: 'Test Schema',
    version: '1.0.0',
    fields: [
      { name: 'field1', type: 'string', required: true },
      { name: 'field2', type: 'number', required: false },
    ],
    createdBy: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    isLatestVersion: false,
  };

  const mockSchema2 = {
    id: 'schema2-id',
    name: 'Test Schema',
    version: '2.0.0',
    fields: [
      { name: 'field1', type: 'string', required: false }, // Changed required
      { name: 'field3', type: 'boolean', required: true }, // New field
    ],
    createdBy: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    isLatestVersion: true,
  };

  const mockComparison = {
    added: [{ name: 'field3', type: 'boolean', required: true }],
    removed: [{ name: 'field2', type: 'number', required: false }],
    modified: [
      {
        field: 'field1',
        before: { type: 'string', required: true },
        after: { type: 'string', required: false },
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (schemaService.getSchemaById as jest.Mock).mockImplementation((id) => {
      if (id === 'schema1-id') return Promise.resolve(mockSchema1);
      if (id === 'schema2-id') return Promise.resolve(mockSchema2);
      return Promise.reject(new Error('Schema not found'));
    });
    
    (schemaService.compareSchemaVersions as jest.Mock).mockResolvedValue(mockComparison);
  });

  test('renders schema comparison correctly with adapter components', async () => {
    render(
      <MemoryRouter>
        <SchemaComparison />
      </MemoryRouter>
    );

    // Check loading state
    expect(screen.getByText('Loading comparison...')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(schemaService.compareSchemaVersions).toHaveBeenCalledWith(
        'schema1-id',
        'schema2-id'
      );
    });

    // Verify that schema names and versions are displayed
    expect(screen.getByText('Schema Comparison')).toBeInTheDocument();
    expect(screen.getByText('Test Schema (v1.0.0)')).toBeInTheDocument();
    expect(screen.getByText('Test Schema (v2.0.0)')).toBeInTheDocument();

    // Check added fields section
    expect(screen.getByText('Added Fields (1)')).toBeInTheDocument();
    expect(screen.getByText('field3 (boolean)')).toBeInTheDocument();

    // Check removed fields section
    expect(screen.getByText('Removed Fields (1)')).toBeInTheDocument();
    expect(screen.getByText('field2 (number)')).toBeInTheDocument();

    // Check modified fields section
    expect(screen.getByText('Modified Fields (1)')).toBeInTheDocument();
    expect(screen.getByText('field1')).toBeInTheDocument();
    
    // Check migration suggestions
    expect(screen.getByText('Suggested Migration Steps')).toBeInTheDocument();
    expect(screen.getByText(/Add 1 new field\(s\): field3/)).toBeInTheDocument();
    expect(screen.getByText(/Remove 1 field\(s\): field2/)).toBeInTheDocument();
  });

  test('handles error state', async () => {
    // Mock an error response
    (schemaService.getSchemaById as jest.Mock).mockRejectedValue(new Error('API error'));

    render(
      <MemoryRouter>
        <SchemaComparison />
      </MemoryRouter>
    );

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Failed to load schema comparison')).toBeInTheDocument();
    });
  });
}); 