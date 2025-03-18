import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Button,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Badge,
  Select,
  useToast,
  Flex,
} from '../../ui/chakra-adapter';
import { Schema } from 'shared/src/types';
import * as schemaService from '../../services/schemaService';
import { useNavigate, useParams } from 'react-router-dom';

interface SchemaVersioningProps {
  schema?: Schema;
  onVersionCreate?: (schema: Schema) => void;
}

const SchemaVersioning: React.FC<SchemaVersioningProps> = ({ schema, onVersionCreate }) => {
  const [versions, setVersions] = useState<Schema[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedSchema1, setSelectedSchema1] = useState<string>('');
  const [selectedSchema2, setSelectedSchema2] = useState<string>('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newVersion, setNewVersion] = useState<string>('');
  const [versionNotes, setVersionNotes] = useState<string>('');
  const navigate = useNavigate();
  const { name } = useParams<{ name: string }>();
  const toast = useToast();
  
  // Add state for confirmation dialog
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState<boolean>(false);

  useEffect(() => {
    if (schema) {
      loadVersions(schema.name);
    } else if (name) {
      loadVersions(name);
    }
  }, [schema, name]);

  const loadVersions = async (schemaName: string) => {
    try {
      setLoading(true);
      const versionsList = await schemaService.getSchemaVersions(schemaName);
      setVersions(versionsList);
      
      // Set default selections if we have versions
      if (versionsList.length >= 2) {
        setSelectedSchema1(versionsList[0].id);
        setSelectedSchema2(versionsList[1].id);
      }
    } catch (error) {
      toast({
        title: 'Error loading versions',
        description: 'Unable to load schema versions.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVersion = async () => {
    if (!schema) return;
    
    try {
      setIsCreatingVersion(true);
      const newSchema = await schemaService.createSchemaVersion(
        schema.id,
        newVersion,
        undefined,
        versionNotes
      );
      
      toast({
        title: 'Version created',
        description: `Version ${newVersion} created successfully.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      if (onVersionCreate) {
        onVersionCreate(newSchema);
      }
      
      setVersions([newSchema, ...versions]);
      onClose();
      setShowConfirmation(false);
    } catch (error) {
      toast({
        title: 'Error creating version',
        description: 'Unable to create new schema version.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsCreatingVersion(false);
    }
  };
  
  // Add function to handle initial version creation button click
  const handleVersionClick = () => {
    // Validate inputs before showing confirmation
    if (!newVersion || newVersion.trim() === '') {
      toast({
        title: 'Version required',
        description: 'Please enter a version number',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Show confirmation dialog
    setShowConfirmation(true);
  };
  
  // Add function to cancel confirmation
  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleCompare = () => {
    if (selectedSchema1 && selectedSchema2) {
      navigate(`/schemas/compare?schema1=${selectedSchema1}&schema2=${selectedSchema2}`);
    }
  };

  const handleExport = async (schemaId: string) => {
    try {
      const exportData = await schemaService.exportSchema(schemaId);
      
      // Create a downloadable file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `schema-${exportData.schema.name}-${exportData.schema.version}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Unable to export schema.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="md">Schema Versions</Heading>
        {schema && (
          <Button colorScheme="blue" onClick={onOpen}>
            Create New Version
          </Button>
        )}
      </Flex>

      {versions.length > 0 ? (
        <>
          <Box mb={6}>
            <Heading size="sm" mb={2}>
              Compare Versions
            </Heading>
            <Flex gap={4}>
              <Select
                value={selectedSchema1}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSchema1(e.target.value)}
                placeholder="Select first version"
              >
                {versions.map((v) => (
                  <option key={`v1-${v.id}`} value={v.id}>
                    {v.version} ({new Date(v.createdAt).toLocaleDateString()})
                  </option>
                ))}
              </Select>
              <Select
                value={selectedSchema2}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSchema2(e.target.value)}
                placeholder="Select second version"
              >
                {versions.map((v) => (
                  <option key={`v2-${v.id}`} value={v.id}>
                    {v.version} ({new Date(v.createdAt).toLocaleDateString()})
                  </option>
                ))}
              </Select>
              <Button
                colorScheme="purple"
                onClick={handleCompare}
                isDisabled={!selectedSchema1 || !selectedSchema2}
              >
                Compare
              </Button>
            </Flex>
          </Box>

          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Version</Th>
                <Th>Created At</Th>
                <Th>Notes</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {versions.map((version) => (
                <Tr key={version.id}>
                  <Td>{version.version}</Td>
                  <Td>{new Date(version.createdAt).toLocaleString()}</Td>
                  <Td>{version.versionNotes || '-'}</Td>
                  <Td>
                    {version.isLatestVersion ? (
                      <Badge colorScheme="green">Latest</Badge>
                    ) : (
                      <Badge colorScheme="gray">Previous</Badge>
                    )}
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      mr={2}
                      onClick={() => navigate(`/schemas/${version.id}`)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="teal"
                      onClick={() => handleExport(version.id)}
                    >
                      Export
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </>
      ) : (
        <Text>No versions available.</Text>
      )}

      {/* Existing create version modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Schema Version</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4} isRequired>
              <FormLabel>Version Number</FormLabel>
              <Input
                value={newVersion}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewVersion(e.target.value)}
                placeholder="e.g. 1.0.1"
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Version Notes</FormLabel>
              <Textarea
                value={versionNotes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setVersionNotes(e.target.value)}
                placeholder="What changed in this version?"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleVersionClick}
              isDisabled={!newVersion}
            >
              Create Version
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Add confirmation dialog */}
      <Modal isOpen={showConfirmation} onClose={handleCancelConfirmation}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Version Creation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to create a new version <strong>{newVersion}</strong> of the schema "<strong>{schema?.name}</strong>"?
            </Text>
            <Text mt={2}>
              This action cannot be undone. The new version will become the latest version for this schema.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCancelConfirmation}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleCreateVersion}
              isLoading={isCreatingVersion}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SchemaVersioning; 