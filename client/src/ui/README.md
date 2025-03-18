# UI Adapter Pattern

This folder contains adapters for UI components that were previously using Chakra UI. Due to compatibility issues with Chakra UI v3 and the latest versions of React, we've implemented a lightweight adapter pattern to maintain the same component API while using native HTML elements under the hood.

## Why this approach?

1. **Compatibility**: Chakra UI v3 has compatibility issues with React 19
2. **Simplicity**: Reduces dependencies and complexity
3. **Performance**: Uses native HTML elements which are more performant
4. **Maintainability**: Keeps the same component API, making migration easier

## How to use

To use the adapter in a component, simply change the import path from `@chakra-ui/react` to `../../ui/chakra-adapter`:

**Before:**
```jsx
import { Box, Button, Flex } from '@chakra-ui/react';
```

**After:**
```jsx
import { Box, Button, Flex } from '../../ui/chakra-adapter';
```

Similarly, for icons:

**Before:**
```jsx
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
```

**After:**
```jsx
import { AddIcon, DeleteIcon } from '../../ui/icon-adapter';
```

## Supported Components

The adapter supports the following components:

### Layout Components
- Box
- Flex
- Stack
- Card
- Divider

### Typography
- Heading
- Text

### Form Elements
- FormControl
- FormLabel
- Input
- Select
- Checkbox
- NumberInput (with NumberInputField, NumberInputStepper, etc.)

### Interactive Elements
- Button
- IconButton
- Tooltip

### Feedback & Overlay
- Modal (with ModalOverlay, ModalContent, etc.)
- Toast system (via useToast hook)

### Utilities
- useDisclosure (for controlling modals, drawers, etc.)

## Adding New Components

If you need a component that's not included in the adapter yet, you can easily add it by following the existing patterns:

1. Define the component interface (props) similar to Chakra's API
2. Create a simple implementation using native HTML elements
3. Add appropriate styling to match Chakra's look and feel
4. Export the component from the adapter file

## Styling

Components use inline styles for simplicity and to avoid additional CSS dependencies. The styles aim to match Chakra UI's default appearance while keeping the implementation lightweight.

For more complex styling needs, you can always pass additional style props or className props to the components.

## Component Status

The following components have been implemented in the adapter:

### Basic Components
- Box
- Flex
- Heading
- Text
- Spinner

### Form Components
- Button
- FormControl
- FormLabel
- Input
- Textarea
- Select

### Feedback Components
- Alert
- AlertIcon
- Badge

### Data Display
- Table (Thead, Tbody, Tr, Th, Td)
- Card (CardHeader, CardBody)
- Accordion (AccordionItem, AccordionButton, AccordionPanel, AccordionIcon)

### Overlay Components
- Modal (ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton)

### Hooks
- useDisclosure
- useToast

## Current Limitations

- **Styling**: Basic styling is implemented, but some advanced styling options may not work exactly as in Chakra UI.
- **Animations**: Transition animations are not implemented.
- **Accessibility**: Some accessibility features may be missing compared to Chakra UI.

## Future Migration Path

This adapter is a temporary solution. The long-term plan is to:

1. Complete migration to Chakra UI v3 for all components
2. Update component usage to align with the new v3 API
3. Remove this adapter once all components have been properly migrated

## Components Using the Adapter

- SchemaVersioning
- SchemaComparison
- Schema Index page
- Schema Compare page

## Testing

Tests for components using the adapter have been created to ensure functionality works correctly:
- `SchemaVersioningAdapter.test.tsx`
- `SchemaComparisonAdapter.test.tsx` 