import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  Text,
  IconButton,
  Flex,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '../../ui/chakra-adapter';
import { AddIcon, DeleteIcon } from '../../ui/icon-adapter';
import { FieldType, ValidationRule } from 'shared/src/types';

interface ValidationRulesEditorProps {
  fieldType: FieldType;
  validationRules: ValidationRule[];
  onChange: (rules: ValidationRule[]) => void;
}

const ValidationRulesEditor: React.FC<ValidationRulesEditorProps> = ({
  fieldType,
  validationRules,
  onChange,
}) => {
  const [newRuleType, setNewRuleType] = useState<string>('');

  // Define available validation rules based on field type
  const getAvailableRules = (): string[] => {
    switch (fieldType) {
      case FieldType.STRING:
        return ['minLength', 'maxLength', 'pattern', 'enum'];
      case FieldType.NUMBER:
        return ['min', 'max', 'multipleOf'];
      case FieldType.ARRAY:
        return ['minItems', 'maxItems', 'uniqueItems'];
      case FieldType.DATE:
        return ['minDate', 'maxDate'];
      default:
        return [];
    }
  };

  const handleAddRule = () => {
    if (!newRuleType) return;

    // Initialize with default value based on rule type
    let defaultValue: string | number | boolean | RegExp | string[];
    switch (newRuleType) {
      case 'minLength':
      case 'maxLength':
      case 'min':
      case 'max':
      case 'multipleOf':
      case 'minItems':
      case 'maxItems':
        defaultValue = 0;
        break;
      case 'pattern':
        defaultValue = '';
        break;
      case 'enum':
        defaultValue = [];
        break;
      case 'uniqueItems':
        defaultValue = true;
        break;
      case 'minDate':
      case 'maxDate':
        defaultValue = new Date().toISOString();
        break;
      default:
        defaultValue = '';
    }

    const newRule: ValidationRule = {
      type: newRuleType,
      value: defaultValue,
    };

    onChange([...validationRules, newRule]);
    setNewRuleType('');
  };

  const handleRemoveRule = (index: number) => {
    const updatedRules = [...validationRules];
    updatedRules.splice(index, 1);
    onChange(updatedRules);
  };

  const handleRuleValueChange = (index: number, value: string | number | boolean | RegExp | string[]) => {
    const updatedRules = [...validationRules];
    updatedRules[index] = { ...updatedRules[index], value };
    onChange(updatedRules);
  };

  const renderRuleValueInput = (rule: ValidationRule, index: number) => {
    switch (rule.type) {
      case 'minLength':
      case 'maxLength':
      case 'min':
      case 'max':
      case 'multipleOf':
      case 'minItems':
      case 'maxItems':
        return (
          <NumberInput
            value={rule.value}
            min={0}
            onChange={(valueString: string, valueNumber: number) =>
              handleRuleValueChange(index, valueNumber)
            }
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        );
      case 'pattern':
        return (
          <Input
            value={rule.value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRuleValueChange(index, e.target.value)}
            placeholder="Regular expression"
          />
        );
      case 'enum':
        return (
          <Input
            value={Array.isArray(rule.value) ? rule.value.join(', ') : ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleRuleValueChange(
                index,
                e.target.value.split(',').map((item: string) => item.trim())
              )
            }
            placeholder="Comma-separated values"
          />
        );
      case 'uniqueItems':
        return (
          <Select
            value={rule.value ? 'true' : 'false'}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleRuleValueChange(index, e.target.value === 'true')}
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </Select>
        );
      case 'minDate':
      case 'maxDate':
        return (
          <Input
            type="date"
            value={
              rule.value
                ? new Date(rule.value).toISOString().substring(0, 10)
                : new Date().toISOString().substring(0, 10)
            }
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const date = new Date(e.target.value);
              handleRuleValueChange(index, date.toISOString());
            }}
          />
        );
      default:
        return (
          <Input
            value={rule.value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRuleValueChange(index, e.target.value)}
          />
        );
    }
  };

  return (
    <Box>
      <Text fontWeight="bold" mb={2}>
        Validation Rules
      </Text>

      {validationRules.length === 0 ? (
        <Text fontSize="sm" color="gray.500" mb={4}>
          No validation rules defined
        </Text>
      ) : (
        <Stack spacing={3} mb={4}>
          {validationRules.map((rule, index) => (
            <Flex key={index} alignItems="center">
              <Text fontWeight="medium" width="120px">
                {rule.type}:
              </Text>
              <Box flex="1">{renderRuleValueInput(rule, index)}</Box>
              <IconButton
                aria-label="Remove rule"
                icon={<DeleteIcon />}
                size="sm"
                ml={2}
                colorScheme="red"
                variant="ghost"
                onClick={() => handleRemoveRule(index)}
              />
            </Flex>
          ))}
        </Stack>
      )}

      <Flex mt={2}>
        <Select
          placeholder="Select rule type"
          value={newRuleType}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewRuleType(e.target.value)}
          style={{ flex: '1', marginRight: '0.5rem' }}
        >
          {getAvailableRules().map((ruleType) => (
            <option key={ruleType} value={ruleType}>
              {ruleType}
            </option>
          ))}
        </Select>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={handleAddRule}
          isDisabled={!newRuleType}
        >
          Add Rule
        </Button>
      </Flex>
    </Box>
  );
};

export default ValidationRulesEditor; 