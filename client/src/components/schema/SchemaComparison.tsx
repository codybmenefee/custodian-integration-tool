import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Alert,
  AlertIcon,
  useToast,
} from '../../ui/chakra-adapter';
import { useSearchParams } from 'react-router-dom';
import * as schemaService from '../../services/schemaService';
import { Schema, SchemaComparison as SchemaComparisonType, SchemaField } from 'shared/src/types';

const SchemaComparison: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [schema1, setSchema1] = useState<Schema | null>(null);
  const [schema2, setSchema2] = useState<Schema | null>(null);
  const [comparison, setComparison] = useState<SchemaComparisonType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const schemaId1 = searchParams.get('schema1');
        const schemaId2 = searchParams.get('schema2');

        if (!schemaId1 || !schemaId2) {
          setError('Two schema IDs are required for comparison');
          return;
        }

        // Fetch both schemas
        const [fetchedSchema1, fetchedSchema2] = await Promise.all([
          schemaService.getSchemaById(schemaId1),
          schemaService.getSchemaById(schemaId2),
        ]);

        setSchema1(fetchedSchema1);
        setSchema2(fetchedSchema2);

        // Compare schemas
        const comparisonResult = await schemaService.compareSchemaVersions(schemaId1, schemaId2);
        setComparison(comparisonResult);
      } catch (err) {
        console.error('Error loading schema comparison:', err);
        setError('Failed to load schema comparison');
        toast({
          title: 'Error',
          description: 'Failed to load schema comparison',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams, toast]);

  const renderTypeChangeBadge = (before: string, after: string) => {
    return (
      <Box>
        <Badge colorScheme="red" textDecoration="line-through" mr={2}>
          {before}
        </Badge>
        <Badge colorScheme="green">{after}</Badge>
      </Box>
    );
  };

  const renderRequiredChangeBadge = (before: boolean, after: boolean) => {
    if (before && !after) {
      return (
        <Box>
          <Badge colorScheme="red" textDecoration="line-through" mr={2}>
            Required
          </Badge>
          <Badge colorScheme="gray">Optional</Badge>
        </Box>
      );
    } else if (!before && after) {
      return (
        <Box>
          <Badge colorScheme="gray" textDecoration="line-through" mr={2}>
            Optional
          </Badge>
          <Badge colorScheme="green">Required</Badge>
        </Box>
      );
    }
    return before ? <Badge colorScheme="blue">Required</Badge> : <Badge colorScheme="gray">Optional</Badge>;
  };

  const suggestMigrationSteps = () => {
    if (!comparison) return null;

    const steps: string[] = [];

    // Added fields
    if (comparison.added.length > 0) {
      steps.push(`Add ${comparison.added.length} new field(s): ${comparison.added.map(f => f.name).join(', ')}`);
      
      // Check if any added fields are required
      const requiredFields = comparison.added.filter(f => f.required);
      if (requiredFields.length > 0) {
        steps.push(`Provide values for required field(s): ${requiredFields.map(f => f.name).join(', ')}`);
      }
    }

    // Removed fields
    if (comparison.removed.length > 0) {
      steps.push(`Remove ${comparison.removed.length} field(s): ${comparison.removed.map(f => f.name).join(', ')}`);
    }

    // Modified fields
    if (comparison.modified.length > 0) {
      const typeChanges = comparison.modified.filter(m => m.before.type !== m.after.type);
      if (typeChanges.length > 0) {
        steps.push(`Convert ${typeChanges.length} field(s) to new type(s): ${typeChanges.map(m => m.field).join(', ')}`);
      }

      const requiredChanges = comparison.modified.filter(
        m => m.before.required !== m.after.required && m.after.required
      );
      if (requiredChanges.length > 0) {
        steps.push(`Ensure values for newly required field(s): ${requiredChanges.map(m => m.field).join(', ')}`);
      }
    }

    return steps;
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading comparison...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  if (!schema1 || !schema2 || !comparison) {
    return (
      <Alert status="warning">
        <AlertIcon />
        Unable to load schema comparison data
      </Alert>
    );
  }

  const migrationSteps = suggestMigrationSteps();

  return (
    <Box p={4}>
      <Heading mb={4}>Schema Comparison</Heading>
      
      <Box mb={6} p={4} borderWidth="1px" borderRadius="lg">
        <Heading size="md" mb={2}>Comparing Versions</Heading>
        <Box display="flex" gap={4}>
          <Card flex="1">
            <CardHeader bg="blue.50">
              <Heading size="sm">
                {schema1.name} (v{schema1.version})
              </Heading>
              <Text fontSize="sm" color="gray.600">
                {new Date(schema1.createdAt).toLocaleString()}
              </Text>
            </CardHeader>
          </Card>
          
          <Card flex="1">
            <CardHeader bg="green.50">
              <Heading size="sm">
                {schema2.name} (v{schema2.version})
              </Heading>
              <Text fontSize="sm" color="gray.600">
                {new Date(schema2.createdAt).toLocaleString()}
              </Text>
            </CardHeader>
          </Card>
        </Box>
      </Box>
      
      {/* Migration suggestions */}
      {migrationSteps && migrationSteps.length > 0 && (
        <Box mb={6}>
          <Heading size="md" mb={2}>Suggested Migration Steps</Heading>
          <Card>
            <CardBody>
              <ol>
                {migrationSteps.map((step, index) => (
                  <li key={index}>
                    <Text mb={2}>{step}</Text>
                  </li>
                ))}
              </ol>
            </CardBody>
          </Card>
        </Box>
      )}

      {/* Field changes summary */}
      <Box mb={6}>
        <Heading size="md" mb={2}>Changes Summary</Heading>
        <Box display="flex" gap={4}>
          <Card flex="1">
            <CardHeader bg="green.100">
              <Heading size="sm">
                Added Fields ({comparison.added.length})
              </Heading>
            </CardHeader>
            <CardBody>
              {comparison.added.length === 0 ? (
                <Text>No fields added</Text>
              ) : (
                <ul>
                  {comparison.added.map(field => (
                    <li key={field.name}>
                      <Text>
                        <strong>{field.name}</strong> ({field.type})
                        {field.required && <Badge ml={2} colorScheme="red">Required</Badge>}
                      </Text>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
          
          <Card flex="1">
            <CardHeader bg="red.100">
              <Heading size="sm">
                Removed Fields ({comparison.removed.length})
              </Heading>
            </CardHeader>
            <CardBody>
              {comparison.removed.length === 0 ? (
                <Text>No fields removed</Text>
              ) : (
                <ul>
                  {comparison.removed.map(field => (
                    <li key={field.name}>
                      <Text>
                        <strong>{field.name}</strong> ({field.type})
                        {field.required && <Badge ml={2} colorScheme="red">Required</Badge>}
                      </Text>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
          
          <Card flex="1">
            <CardHeader bg="purple.100">
              <Heading size="sm">
                Modified Fields ({comparison.modified.length})
              </Heading>
            </CardHeader>
            <CardBody>
              {comparison.modified.length === 0 ? (
                <Text>No fields modified</Text>
              ) : (
                <ul>
                  {comparison.modified.map(mod => (
                    <li key={mod.field}>
                      <Text>
                        <strong>{mod.field}</strong>
                      </Text>
                      {mod.before.type !== mod.after.type && (
                        <Text ml={2} fontSize="sm">
                          Type: {renderTypeChangeBadge(mod.before.type as string, mod.after.type as string)}
                        </Text>
                      )}
                      {mod.before.required !== mod.after.required && (
                        <Text ml={2} fontSize="sm">
                          Required: {renderRequiredChangeBadge(!!mod.before.required, !!mod.after.required)}
                        </Text>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </Box>
      </Box>
      
      {/* Detailed comparison */}
      <Accordion allowToggle>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex='1' textAlign='left'>
                <Heading size="sm">Detailed Field Comparison</Heading>
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel style={{ paddingBottom: '1rem' }}>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Field</Th>
                  <Th>Status</Th>
                  <Th>Type</Th>
                  <Th>Required</Th>
                  <Th>Description</Th>
                </Tr>
              </Thead>
              <Tbody>
                {/* Combine all schema fields for a complete view */}
                {[...schema1.fields, ...comparison.added]
                  .filter((field, index, self) => 
                    index === self.findIndex(f => f.name === field.name)
                  )
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(field => {
                    const isAdded = comparison.added.some(f => f.name === field.name);
                    const isRemoved = comparison.removed.some(f => f.name === field.name);
                    const isModified = comparison.modified.some(m => m.field === field.name);
                    const modDetails = comparison.modified.find(m => m.field === field.name);
                    
                    // Find matching field in schema2
                    const field2 = schema2.fields.find(f => f.name === field.name);
                    
                    return (
                      <Tr key={field.name} bg={isAdded ? 'green.50' : isRemoved ? 'red.50' : isModified ? 'yellow.50' : undefined}>
                        <Td fontWeight="bold">{field.name}</Td>
                        <Td>
                          {isAdded ? (
                            <Badge colorScheme="green">Added</Badge>
                          ) : isRemoved ? (
                            <Badge colorScheme="red">Removed</Badge>
                          ) : isModified ? (
                            <Badge colorScheme="yellow">Modified</Badge>
                          ) : (
                            <Badge colorScheme="gray">Unchanged</Badge>
                          )}
                        </Td>
                        <Td>
                          {isModified && modDetails?.before.type !== modDetails?.after.type
                            ? renderTypeChangeBadge(modDetails?.before.type as string, modDetails?.after.type as string)
                            : field.type}
                        </Td>
                        <Td>
                          {isModified && modDetails?.before.required !== modDetails?.after.required
                            ? renderRequiredChangeBadge(!!modDetails?.before.required, !!modDetails?.after.required)
                            : field.required
                            ? <Badge colorScheme="blue">Required</Badge>
                            : <Badge colorScheme="gray">Optional</Badge>}
                        </Td>
                        <Td>
                          {isModified && modDetails?.before.description !== modDetails?.after.description
                            ? (
                              <>
                                <Text textDecoration="line-through" color="red.500">
                                  {modDetails?.before.description}
                                </Text>
                                <Text color="green.500">{modDetails?.after.description}</Text>
                              </>
                            )
                            : field.description || '-'}
                        </Td>
                      </Tr>
                    );
                  })}
              </Tbody>
            </Table>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};

export default SchemaComparison; 