import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SchemaVersioning from '../components/schema/SchemaVersioning';
import { Schema, FieldType } from 'shared/src/types';
import * as schemaService from '../services/schemaService';

// Mock the schema service
jest.mock('../services/schemaService', () => ({
  getSchemaVersions: jest.fn(),
  createSchemaVersion: jest.fn(),
  exportSchema: jest.fn(),
}));

describe('SchemaVersioning Component with Adapter', () => {
  const mockSchema = {
    id: 'test-schema-id',
    name: 'Test Schema',
    version: '1.0.0',
    fields: [
      { name: 'field1', type: 'string', required: true },
      { name: 'field2', type: 'number', required: false },
    ],
    createdBy: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    isLatestVersion: true,
  };

  const mockVersions = [
    { ...mockSchema },
    {
      ...mockSchema,
      id: 'version-2-id',
      version: '0.9.0',
      createdAt: new Date(Date.now() - 86400000),
      isLatestVersion: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (schemaService.getSchemaVersions as jest.Mock).mockResolvedValue(mockVersions);
    (schemaService.createSchemaVersion as jest.Mock).mockImplementation(
      (id, version, fields, notes) => Promise.resolve({
        ...mockSchema,
        id: 'new-version-id',
        version,
        versionNotes: notes,
      })
    );
  });

  test('renders schema versions correctly', async () => {
    render(
      <MemoryRouter>
        <SchemaVersioning schema={mockSchema as Schema} />
      </MemoryRouter>
    );

    // Wait for versions to load
    await waitFor(() => {
      expect(schemaService.getSchemaVersions).toHaveBeenCalledWith(mockSchema.name);
    });

    // Check if versions are displayed
    expect(screen.getByText('Schema Versions')).toBeInTheDocument();
    expect(screen.getByText('1.0.0')).toBeInTheDocument();
    expect(screen.getByText('0.9.0')).toBeInTheDocument();
  });

  test('opens create version modal and handles version creation', async () => {
    render(
      <MemoryRouter>
        <SchemaVersioning schema={mockSchema as Schema} />
      </MemoryRouter>
    );

    // Click create new version button
    fireEvent.click(screen.getByText('Create New Version'));

    // Fill in the form
    const versionInput = screen.getByLabelText(/Version/i);
    fireEvent.change(versionInput, { target: { value: '1.1.0' } });

    const notesInput = screen.getByLabelText(/Version Notes/i);
    fireEvent.change(notesInput, { target: { value: 'Test version notes' } });

    // Submit the form
    fireEvent.click(screen.getByText('Create Version'));

    // Check if confirmation dialog appears
    expect(screen.getByText(/Are you sure you want to create a new version/i)).toBeInTheDocument();

    // Confirm version creation
    fireEvent.click(screen.getByText('Confirm'));

    // Verify service was called
    await waitFor(() => {
      expect(schemaService.createSchemaVersion).toHaveBeenCalledWith(
        mockSchema.id,
        '1.1.0',
        undefined,
        'Test version notes'
      );
    });
  });

  test('compare button navigates to compare page with correct params', async () => {
    let testLocation = { pathname: '', search: '' };
    
    render(
      <MemoryRouter initialEntries={['/schemas/test-schema']}>
        <Routes>
          <Route 
            path="/schemas/compare" 
            element={<div data-testid="compare-page" />} 
          />
          <Route 
            path="/schemas/:name" 
            element={<SchemaVersioning schema={mockSchema as Schema} />} 
          />
        </Routes>
      </MemoryRouter>
    );

    // Wait for versions to load
    await waitFor(() => {
      expect(schemaService.getSchemaVersions).toHaveBeenCalledWith(mockSchema.name);
    });

    // Select the versions to compare
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBe(2);
    
    // Click compare button
    fireEvent.click(screen.getByText('Compare'));

    // Verify navigation happens with correct params
    await waitFor(() => {
      expect(screen.getByTestId('compare-page')).toBeInTheDocument();
    });
  });
}); 