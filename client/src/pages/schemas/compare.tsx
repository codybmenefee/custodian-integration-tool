import React, { useState, useEffect } from 'react';
import { Box, Heading, Button, Flex } from '../../ui/chakra-adapter';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import SchemaComparison from '../../components/schema/SchemaComparison';
import * as schemaService from '../../services/schemaService';

const SchemaComparisonPage = () => {
  const [searchParams] = useSearchParams();
  const [schemaName, setSchemaName] = useState<string>('');
  
  useEffect(() => {
    const fetchSchemaInfo = async () => {
      try {
        const schemaId1 = searchParams.get('schema1');
        if (schemaId1) {
          const schema = await schemaService.getSchemaById(schemaId1);
          setSchemaName(schema.name);
        }
      } catch (error) {
        console.error('Error fetching schema info:', error);
      }
    };
    
    fetchSchemaInfo();
  }, [searchParams]);

  return (
    <Box p={5}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Schema Comparison</Heading>
        <Flex gap={4} align="center">
          {schemaName && (
            <RouterLink to={`/schemas/${schemaName}`}>
              <Button 
                variant="outline"
                colorScheme="blue"
              >
                Back to Schema
              </Button>
            </RouterLink>
          )}
          <RouterLink to="/schemas" style={{ color: '#3182ce' }}>
            Back to Schemas
          </RouterLink>
        </Flex>
      </Flex>
      
      <SchemaComparison />
    </Box>
  );
};

export default SchemaComparisonPage; 