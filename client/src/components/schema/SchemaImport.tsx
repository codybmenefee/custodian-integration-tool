import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Heading,
  Text,
  Stack,
  Code,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
} from '../../ui/chakra-adapter';
import { useAuth } from '../../contexts/AuthContext';
import * as schemaService from '../../services/schemaService';
import { Schema, SchemaExport } from 'shared/src/types';

interface SchemaImportProps {
  onImportSuccess?: (schema: Schema) => void;
}

const SchemaImport: React.FC<SchemaImportProps> = ({ onImportSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<SchemaExport | null>(null);
  const [isValidJson, setIsValidJson] = useState<boolean>(true);
  const [isValidSchema, setIsValidSchema] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useAuth();
  const toast = useToast();

  interface SchemaImportContent {
    schema: {
      [key: string]: unknown;
    };
    metadata: {
      [key: string]: unknown;
    };
  }

  const validateSchemaStructure = (content: unknown): boolean => {
    // First, check that the overall structure is correct
    if (!content || typeof content !== 'object') {
      return false;
    }
    
    // Check that required top-level properties exist
    const contentObj = content as Partial<SchemaImportContent>;
    if (!contentObj.schema || !contentObj.metadata || typeof contentObj.schema !== 'object' || typeof contentObj.metadata !== 'object') {
      return false;
    }

    const { schema, metadata } = contentObj;
    
    // Validate schema properties
    if (!schema.name || typeof schema.name !== 'string' || schema.name.trim() === '') {
      return false;
    }
    
    if (!schema.version || typeof schema.version !== 'string' || !/^\d+\.\d+\.\d+$/.test(schema.version)) {
      return false;
    }
    
    if (!Array.isArray(schema.fields)) {
      return false;
    }
    
    // Validate metadata
    if (!metadata.exportedAt || !metadata.exportedBy) {
      return false;
    }
    
    // Validate fields
    return schema.fields.every((field: any) => {
      // Each field must have a name, type, and required property
      if (!field.name || typeof field.name !== 'string' || field.name.trim() === '') {
        return false;
      }
      
      if (!field.type || typeof field.type !== 'string') {
        return false;
      }
      
      // Validate that the type is one of the allowed types
      const allowedTypes = ['string', 'number', 'boolean', 'date', 'object', 'array'];
      if (!allowedTypes.includes(field.type.toLowerCase())) {
        return false;
      }
      
      if (typeof field.required !== 'boolean') {
        return false;
      }
      
      return true;
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    setFileContent(null);
    setIsValidJson(true);
    setIsValidSchema(true);

    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.endsWith('.json')) {
        toast({
          title: 'Invalid File Type',
          description: 'Please select a JSON file',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setFile(null);
        return;
      }

      // Validate file size (5MB max)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Maximum file size is 5MB',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setFile(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
          
          // Validate basic structure
          const isValid = validateSchemaStructure(content);
          setIsValidSchema(isValid);
          
          if (isValid) {
            setFileContent(content);
          } else {
            toast({
              title: 'Invalid Schema Structure',
              description: 'The file does not contain a valid schema structure',
              status: 'warning',
              duration: 3000,
              isClosable: true,
            });
          }
        } catch (error) {
          setIsValidJson(false);
          setFileContent(null);
          toast({
            title: 'Invalid JSON',
            description: 'The file does not contain valid JSON',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      };
      
      reader.onerror = () => {
        toast({
          title: 'Read Error',
          description: 'Failed to read the file',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setFile(null);
      };
      
      reader.readAsText(selectedFile);
    }
  };

  const handleUpload = () => {
    if (file && fileContent && isValidJson && isValidSchema) {
      onOpen();
    } else {
      toast({
        title: 'Invalid File',
        description: 'Please select a valid schema JSON file.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleImport = async () => {
    if (!fileContent || !user) return;

    try {
      setIsImporting(true);
      
      // Additional validation before import
      if (!validateSchemaStructure(fileContent)) {
        throw new Error('Invalid schema structure');
      }
      
      const importedSchema = await schemaService.importSchema(fileContent);

      toast({
        title: 'Schema Imported',
        description: `Schema "${importedSchema.name}" (v${importedSchema.version}) imported successfully.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onClose();
      
      if (onImportSuccess) {
        onImportSuccess(importedSchema);
      }
    } catch (error: Error | unknown) {
      let errorMessage = 'Failed to import schema. Please check the file format and try again.';
      
      // Check for specific API error responses
      if (error && typeof error === 'object' && 'response' in error && 
          error.response && typeof error.response === 'object' && 
          'data' in error.response && error.response.data && 
          typeof error.response.data === 'object' && 
          'message' in error.response.data) {
        errorMessage = error.response.data.message as string;
      }
      
      toast({
        title: 'Import Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg">
      <Heading size="md" mb={4}>
        Import Schema
      </Heading>

      <Stack spacing={4}>
        <FormControl>
          <FormLabel>Upload Schema JSON File</FormLabel>
          <Input 
            type="file" 
            accept=".json" 
            onChange={handleFileChange}
            style={{ padding: '1px' }}
          />
          <Text style={{ fontSize: '0.875rem', color: 'gray.500', marginTop: '0.25rem' }}>
            Select a schema export file in JSON format
          </Text>
        </FormControl>

        {file && !isValidJson && (
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Invalid JSON</AlertTitle>
            <AlertDescription>
              The selected file does not contain valid JSON. Please check the file and try again.
            </AlertDescription>
          </Alert>
        )}

        {file && isValidJson && !isValidSchema && (
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Invalid Schema Format</AlertTitle>
            <AlertDescription>
              The file does not contain a valid schema structure. Please check the file and try again.
            </AlertDescription>
          </Alert>
        )}

        {fileContent && isValidSchema && (
          <Alert status="success">
            <AlertIcon />
            <AlertTitle>Valid Schema</AlertTitle>
            <AlertDescription>
              Schema "{fileContent.schema.name}" (v{fileContent.schema.version}) with {fileContent.schema.fields.length} fields is ready to be imported.
            </AlertDescription>
          </Alert>
        )}

        <Button 
          colorScheme="blue" 
          isDisabled={!file || !isValidJson || !isValidSchema}
          onClick={handleUpload}
          isLoading={isUploading}
        >
          Preview and Import
        </Button>
      </Stack>

      {/* Preview Modal */}
      <Modal isOpen={isOpen} onClose={onClose} style={{ maxWidth: '36rem' }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Import Schema Preview
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            {fileContent && (
              <Box>
                <Stack spacing={4}>
                  <Box>
                    <Heading size="sm">Schema Details</Heading>
                    <Text>
                      <strong>Name:</strong> {fileContent.schema.name}
                    </Text>
                    <Text>
                      <strong>Version:</strong> {fileContent.schema.version}
                    </Text>
                    <Text>
                      <strong>Fields:</strong> {fileContent.schema.fields.length}
                    </Text>
                    <Text>
                      <strong>Exported At:</strong> {typeof fileContent.metadata.exportedAt === 'string' 
                        ? new Date(fileContent.metadata.exportedAt).toLocaleString() 
                        : new Date(fileContent.metadata.exportedAt as unknown as string).toLocaleString()}
                    </Text>
                  </Box>

                  <Box>
                    <Heading size="sm" style={{ marginBottom: '0.5rem' }}>Fields</Heading>
                    <Table style={{ fontSize: '0.875rem' }}>
                      <Thead>
                        <Tr>
                          <Th>Name</Th>
                          <Th>Type</Th>
                          <Th>Required</Th>
                          <Th>Description</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {fileContent.schema.fields.map((field) => (
                          <Tr key={field.name}>
                            <Td>{field.name}</Td>
                            <Td>{field.type}</Td>
                            <Td>
                              {field.required ? (
                                <Badge colorScheme="red">Required</Badge>
                              ) : (
                                <Badge colorScheme="gray">Optional</Badge>
                              )}
                            </Td>
                            <Td>{field.description || '-'}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </Stack>
              </Box>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="green" 
              onClick={handleImport}
              isLoading={isImporting}
            >
              Import Schema
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SchemaImport; 