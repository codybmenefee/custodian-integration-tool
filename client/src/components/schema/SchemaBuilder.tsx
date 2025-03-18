import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useToast,
  IconButton,
  Select,
  Checkbox,
  Flex,
  Tooltip,
} from '../../ui/chakra-adapter';
import { AddIcon, DeleteIcon } from '../../ui/icon-adapter';
import { Schema, SchemaField, FieldType, ValidationRule } from 'shared/src/types';
import { createSchema, updateSchema } from '../../services/schemaService';
import ValidationRulesEditor from './ValidationRulesEditor';

interface SchemaBuilderProps {
  schema?: Schema;
  onSave?: (schema: Schema) => void;
}

const SchemaBuilder: React.FC<SchemaBuilderProps> = ({ schema, onSave }) => {
  const initialField: SchemaField = {
    name: '',
    type: FieldType.STRING,
    required: false,
  };

  const [name, setName] = useState<string>(schema?.name || '');
  const [version, setVersion] = useState<string>(schema?.version || '1.0.0');
  const [fields, setFields] = useState<SchemaField[]>(schema?.fields || []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<number | null>(null);

  const toast = useToast();

  useEffect(() => {
    if (schema) {
      setName(schema.name);
      setVersion(schema.version);
      setFields(schema.fields);
    }
  }, [schema]);

  const handleAddField = () => {
    setFields([...fields, { ...initialField, name: `field_${fields.length + 1}` }]);
  };

  const handleRemoveField = (index: number) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
    if (selectedFieldIndex === index) {
      setSelectedFieldIndex(null);
    }
  };

  const handleFieldChange = (index: number, field: Partial<SchemaField>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...field };
    setFields(newFields);
  };

  const handleSave = async () => {
    if (!name) {
      setError('Schema name is required');
      return;
    }

    if (fields.length === 0) {
      setError('At least one field is required');
      return;
    }

    // Validate field names
    const fieldNames = new Set<string>();
    for (const field of fields) {
      if (!field.name) {
        setError('All fields must have a name');
        return;
      }
      if (fieldNames.has(field.name)) {
        setError(`Duplicate field name: ${field.name}`);
        return;
      }
      fieldNames.add(field.name);
    }

    setIsLoading(true);
    setError(null);

    try {
      let savedSchema: Schema;
      if (schema?.id) {
        // Update existing schema
        savedSchema = await updateSchema(schema.id, { name, version, fields });
        toast({
          title: 'Schema updated',
          status: 'success',
          duration: 3000,
        });
      } else {
        // Create new schema
        savedSchema = await createSchema(name, fields, version);
        toast({
          title: 'Schema created',
          status: 'success',
          duration: 3000,
        });
      }

      if (onSave) {
        onSave(savedSchema);
      }
    } catch (err) {
      setError('Failed to save schema. Please try again.');
      console.error('Error saving schema:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectField = (index: number) => {
    setSelectedFieldIndex(index);
  };

  const handleValidationRuleChange = (validationRules: ValidationRule[]) => {
    if (selectedFieldIndex !== null) {
      handleFieldChange(selectedFieldIndex, { validationRules });
    }
  };

  return (
    <Box>
      <Heading size="lg" mb={4}>
        {schema?.id ? 'Edit Schema' : 'Create New Schema'}
      </Heading>

      <Card p={4} mb={4}>
        <Stack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Schema Name</FormLabel>
            <Input
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              placeholder="Enter schema name"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Version</FormLabel>
            <Input
              value={version}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVersion(e.target.value)}
              placeholder="1.0.0"
            />
          </FormControl>
        </Stack>
      </Card>

      <Heading size="md" mb={2}>
        Fields
      </Heading>

      <Flex>
        <Box flex="1" mr={4}>
          <Card p={4} mb={4}>
            <Stack spacing={2}>
              {fields.map((field, index) => (
                <Flex
                  key={index}
                  p={2}
                  borderWidth={selectedFieldIndex === index ? 2 : 1}
                  borderRadius="md"
                  borderColor={selectedFieldIndex === index ? 'blue.500' : 'gray.200'}
                  alignItems="center"
                  cursor="pointer"
                  onClick={() => selectField(index)}
                >
                  <Box flex="1">
                    <Text fontWeight="bold">{field.name}</Text>
                    <Text fontSize="sm">
                      {field.type}
                      {field.required && ' (Required)'}
                    </Text>
                  </Box>
                  <IconButton
                    aria-label="Remove field"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleRemoveField(index);
                    }}
                  />
                </Flex>
              ))}
              <Button
                leftIcon={<AddIcon />}
                colorScheme="blue"
                variant="outline"
                onClick={handleAddField}
                mt={2}
              >
                Add Field
              </Button>
            </Stack>
          </Card>
        </Box>

        <Box flex="2">
          <Card p={4} mb={4}>
            {selectedFieldIndex !== null ? (
              <Stack spacing={4}>
                <Heading size="sm">Edit Field</Heading>
                <FormControl isRequired>
                  <FormLabel>Field Name</FormLabel>
                  <Input
                    value={fields[selectedFieldIndex].name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFieldChange(selectedFieldIndex, { name: e.target.value })
                    }
                    placeholder="Enter field name"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Field Type</FormLabel>
                  <Select
                    value={fields[selectedFieldIndex].type}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      handleFieldChange(selectedFieldIndex, {
                        type: e.target.value as FieldType,
                      })
                    }
                  >
                    {Object.values(FieldType).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <Checkbox
                    isChecked={fields[selectedFieldIndex].required}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFieldChange(selectedFieldIndex, { required: e.target.checked })
                    }
                  >
                    Required
                  </Checkbox>
                </FormControl>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Input
                    value={fields[selectedFieldIndex].description || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleFieldChange(selectedFieldIndex, { description: e.target.value })
                    }
                    placeholder="Enter field description"
                  />
                </FormControl>

                <Divider />

                <ValidationRulesEditor
                  fieldType={fields[selectedFieldIndex].type}
                  validationRules={fields[selectedFieldIndex].validationRules || []}
                  onChange={handleValidationRuleChange}
                />
              </Stack>
            ) : (
              <Text color="gray.500">Select a field to edit its properties</Text>
            )}
          </Card>
        </Box>
      </Flex>

      {error && (
        <Text color="red.500" mb={4}>
          {error}
        </Text>
      )}

      <Button
        colorScheme="blue"
        onClick={handleSave}
        isLoading={isLoading}
        mt={4}
      >
        {schema?.id ? 'Update Schema' : 'Create Schema'}
      </Button>
    </Box>
  );
};

export default SchemaBuilder; 