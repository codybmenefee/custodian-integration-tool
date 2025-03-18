import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  Spinner, 
  Link, 
  Flex,
  Card,
  CardBody,
  Tabs
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import NextLink from 'next/link';
import SchemaVersioning from '../../components/schema/SchemaVersioning';
import * as schemaService from '../../services/schemaService';
import { Schema } from 'shared/src/types';

const SchemaDetailPage = () => {
  const [schema, setSchema] = useState<Schema | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (id) {
      loadSchema(id);
    }
  }, [id]);

  const loadSchema = async (schemaId: string) => {
    try {
      setLoading(true);
      const data = await schemaService.getSchemaById(schemaId);
      setSchema(data);
      setError(null);
    } catch (err) {
      console.error('Error loading schema:', err);
      setError('Could not load schema details');
    } finally {
      setLoading(false);
    }
  };

  const handleVersionCreate = (newSchema: Schema) => {
    setSchema(newSchema);
  };

  if (loading) {
    return (
      <Box textAlign="center" p={8}>
        <Spinner size="xl" />
        <Heading mt={4} size="md">Loading schema details...</Heading>
      </Box>
    );
  }

  if (error || !schema) {
    return (
      <Box p={5}>
        <Heading size="md" color="red.500">Error: {error || 'Schema not found'}</Heading>
        <Link as={NextLink} href="/schemas" color="blue.500" mt={4} display="inline-block">
          Back to Schemas
        </Link>
      </Box>
    );
  }

  return (
    <Box p={5}>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading size="lg">{schema.name}</Heading>
          <Heading size="sm" color="gray.500">v{schema.version}</Heading>
        </Box>
        <Link as={NextLink} href="/schemas" color="blue.500">
          Back to Schemas
        </Link>
      </Flex>

      <Box mt={6}>
        <Flex mb={4} borderBottom="1px solid" borderColor="gray.200">
          <Box 
            px={4} 
            py={2} 
            cursor="pointer" 
            color={activeTab === 'details' ? 'blue.500' : 'gray.500'}
            borderBottom={activeTab === 'details' ? '2px solid' : 'none'}
            borderColor="blue.500"
            onClick={() => setActiveTab('details')}
          >
            Schema Details
          </Box>
          <Box 
            px={4} 
            py={2} 
            cursor="pointer" 
            color={activeTab === 'versions' ? 'blue.500' : 'gray.500'}
            borderBottom={activeTab === 'versions' ? '2px solid' : 'none'}
            borderColor="blue.500"
            onClick={() => setActiveTab('versions')}
          >
            Versions
          </Box>
        </Flex>

        {activeTab === 'details' && (
          <Box mt={4}>
            <Heading size="md" mb={4}>Fields</Heading>
            {schema.fields.length === 0 ? (
              <Box p={4} borderWidth="1px" borderRadius="md">
                No fields defined in this schema.
              </Box>
            ) : (
              <Box overflowX="auto">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #E2E8F0' }}>Name</th>
                      <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #E2E8F0' }}>Type</th>
                      <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #E2E8F0' }}>Required</th>
                      <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid #E2E8F0' }}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schema.fields.map((field) => (
                      <tr key={field.name}>
                        <td style={{ padding: '10px', borderBottom: '1px solid #E2E8F0' }}>{field.name}</td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #E2E8F0' }}>{field.type}</td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #E2E8F0' }}>{field.required ? 'Yes' : 'No'}</td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #E2E8F0' }}>{field.description || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            )}
          </Box>
        )}
        
        {activeTab === 'versions' && (
          <SchemaVersioning schema={schema} onVersionCreate={handleVersionCreate} />
        )}
      </Box>
    </Box>
  );
};

export default SchemaDetailPage; 