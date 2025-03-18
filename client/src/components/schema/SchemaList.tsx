import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  IconButton,
  Badge,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '../../ui/chakra-adapter';
import { AddIcon, EditIcon, DeleteIcon, ViewIcon } from '../../ui/icon-adapter';
import { Schema } from 'shared/src/types';
import { getSchemas, deleteSchema } from '../../services/schemaService';
import { useNavigate } from 'react-router-dom';

interface SchemaListProps {
  onEditSchema?: (schema: Schema) => void;
  onViewSchema?: (schema: Schema) => void;
}

const SchemaList: React.FC<SchemaListProps> = ({ onEditSchema, onViewSchema }) => {
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [schemaToDelete, setSchemaToDelete] = useState<Schema | null>(null);

  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    loadSchemas();
  }, []);

  const loadSchemas = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSchemas();
      setSchemas(data);
    } catch (err) {
      setError('Failed to load schemas. Please try again.');
      console.error('Error loading schemas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSchema = () => {
    navigate('/schemas/new');
  };

  const handleEditSchema = (schema: Schema) => {
    if (onEditSchema) {
      onEditSchema(schema);
    } else {
      navigate(`/schemas/edit/${schema.id}`);
    }
  };

  const handleViewSchema = (schema: Schema) => {
    if (onViewSchema) {
      onViewSchema(schema);
    } else {
      navigate(`/schemas/${schema.id}`);
    }
  };

  const confirmDelete = (schema: Schema) => {
    setSchemaToDelete(schema);
    onOpen();
  };

  const handleDeleteSchema = async () => {
    if (!schemaToDelete) return;

    try {
      await deleteSchema(schemaToDelete.id);
      setSchemas(schemas.filter((s) => s.id !== schemaToDelete.id));
      toast({
        title: 'Schema deleted',
        status: 'success',
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: 'Failed to delete schema',
        status: 'error',
        duration: 3000,
      });
      console.error('Error deleting schema:', err);
    } finally {
      setSchemaToDelete(null);
      onClose();
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="lg">Schemas</Heading>
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleCreateSchema}>
          Create Schema
        </Button>
      </Flex>

      {isLoading ? (
        <Text>Loading schemas...</Text>
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : schemas.length === 0 ? (
        <Box textAlign="center" p={8}>
          <Text mb={4}>No schemas available</Text>
          <Button colorScheme="blue" onClick={handleCreateSchema}>
            Create Your First Schema
          </Button>
        </Box>
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Version</Th>
              <Th>Fields</Th>
              <Th>Created</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {schemas.map((schema) => (
              <Tr key={schema.id}>
                <Td fontWeight="semibold">{schema.name}</Td>
                <Td>
                  <Badge colorScheme="blue">{schema.version}</Badge>
                </Td>
                <Td>{schema.fields.length}</Td>
                <Td>{formatDate(schema.createdAt)}</Td>
                <Td>
                  <IconButton
                    aria-label="View schema"
                    icon={<ViewIcon />}
                    size="sm"
                    mr={2}
                    onClick={() => handleViewSchema(schema)}
                  />
                  <IconButton
                    aria-label="Edit schema"
                    icon={<EditIcon />}
                    size="sm"
                    mr={2}
                    onClick={() => handleEditSchema(schema)}
                  />
                  <IconButton
                    aria-label="Delete schema"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => confirmDelete(schema)}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete the schema{' '}
            <Text as="span" fontWeight="bold">
              {schemaToDelete?.name}
            </Text>
            ? This action cannot be undone.
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDeleteSchema}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SchemaList; 