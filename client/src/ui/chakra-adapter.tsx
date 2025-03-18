import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Basic types
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type ColorScheme = 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'gray' | 'yellow';
type Status = 'info' | 'warning' | 'success' | 'error';
type Variant = 'solid' | 'outline' | 'ghost' | 'link';
type ButtonType = 'button' | 'submit' | 'reset';

// Toast system
interface ToastProps {
  title: string;
  description?: string;
  status?: Status;
  duration?: number;
  isClosable?: boolean;
}

interface ToastContextType {
  toast: (props: ToastProps) => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
});

// Disclosure / Modal system
interface DisclosureReturn {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
}

export const useDisclosure = (initialState = false): DisclosureReturn => {
  const [isOpen, setIsOpen] = useState(initialState);
  
  return {
    isOpen,
    onOpen: () => setIsOpen(true),
    onClose: () => setIsOpen(false),
    onToggle: () => setIsOpen(!isOpen),
  };
};

// Toast provider
export const CustomChakraProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<(ToastProps & { id: number })[]>([]);
  const [nextId, setNextId] = useState(0);
  
  const toast = (props: ToastProps) => {
    const id = nextId;
    setNextId(id + 1);
    setToasts([...toasts, { ...props, id }]);
    
    if (props.duration !== 0) {
      setTimeout(() => {
        setToasts(current => current.filter(t => t.id !== id));
      }, props.duration || 3000);
    }
  };
  
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{ 
        position: 'fixed', 
        top: '20px', 
        right: '20px', 
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {toasts.map(t => (
          <div 
            key={t.id}
            style={{ 
              padding: '15px', 
              borderRadius: '8px', 
              backgroundColor: t.status === 'error' ? '#FED7D7' : 
                               t.status === 'success' ? '#C6F6D5' : 
                               t.status === 'warning' ? '#FEEBC8' : '#BEE3F8',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              maxWidth: '300px'
            }}
          >
            <div style={{ fontWeight: 'bold' }}>{t.title}</div>
            {t.description && <div style={{ marginTop: '5px' }}>{t.description}</div>}
            {t.isClosable && (
              <button 
                onClick={() => setToasts(current => current.filter(toast => toast.id !== t.id))}
                style={{ 
                  position: 'absolute', 
                  top: '5px', 
                  right: '5px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  return context.toast;
};

// Box & containers
interface BoxProps extends React.HTMLProps<HTMLDivElement> {
  p?: number;
  px?: number;
  py?: number;
  m?: number;
  mb?: number;
  mt?: number;
  ml?: number;
  mr?: number;
  flex?: string;
  textAlign?: string;
  display?: string;
  gap?: number;
  borderWidth?: string | number;
  borderRadius?: string;
  bg?: string;
}

export const Box = ({ 
  children, 
  p,
  px,
  py,
  m,
  mb,
  mt,
  ml,
  mr,
  flex,
  textAlign,
  display,
  gap,
  borderWidth,
  borderRadius,
  bg,
  ...props 
}: BoxProps) => {
  return (
    <div 
      {...props} 
      style={{
        padding: p ? `${p * 0.25}rem` : undefined,
        paddingLeft: px ? `${px * 0.25}rem` : undefined,
        paddingRight: px ? `${px * 0.25}rem` : undefined,
        paddingTop: py ? `${py * 0.25}rem` : undefined,
        paddingBottom: py ? `${py * 0.25}rem` : undefined,
        margin: m ? `${m * 0.25}rem` : undefined,
        marginBottom: mb ? `${mb * 0.25}rem` : undefined,
        marginTop: mt ? `${mt * 0.25}rem` : undefined,
        marginLeft: ml ? `${ml * 0.25}rem` : undefined,
        marginRight: mr ? `${mr * 0.25}rem` : undefined,
        flex: flex,
        textAlign: textAlign as any,
        display: display,
        gap: gap ? `${gap * 0.25}rem` : undefined,
        borderWidth: typeof borderWidth === 'number' ? `${borderWidth}px` : borderWidth,
        borderRadius: borderRadius,
        backgroundColor: bg,
        ...props.style
      }}
    >
      {children}
    </div>
  );
};

interface FlexProps extends BoxProps {
  justifyContent?: string;
  alignItems?: string;
  justify?: string;
  align?: string;
}

export const Flex = ({ 
  children, 
  justifyContent,
  alignItems,
  justify,
  align,
  flex,
  gap,
  ...props 
}: FlexProps) => (
  <div
    {...props}
    style={{
      display: 'flex',
      justifyContent: justifyContent || justify,
      alignItems: alignItems || align,
      flex,
      gap: gap ? `${gap * 0.25}rem` : undefined,
      marginBottom: props.mb ? `${props.mb * 0.25}rem` : undefined,
      marginTop: props.mt ? `${props.mt * 0.25}rem` : undefined,
      marginLeft: props.ml ? `${props.ml * 0.25}rem` : undefined,
      marginRight: props.mr ? `${props.mr * 0.25}rem` : undefined,
      ...props.style
    }}
  >
    {children}
  </div>
);

interface StackProps extends BoxProps {
  spacing?: number;
  flexDirection?: string;
}

export const Stack = ({ 
  children, 
  spacing = 2, 
  mb, 
  flexDirection = 'column',
  ...props 
}: StackProps) => (
  <div
    {...props}
    style={{
      display: 'flex',
      flexDirection: flexDirection as any,
      gap: `${spacing * 0.25}rem`,
      marginBottom: mb ? `${mb * 0.25}rem` : undefined,
      ...props.style
    }}
  >
    {children}
  </div>
);

export const Card = ({ 
  children, 
  p = 4, 
  mb, 
  ...props 
}: BoxProps) => (
  <div
    {...props}
    style={{
      padding: p ? `${p * 0.25}rem` : undefined,
      marginBottom: mb ? `${mb * 0.25}rem` : undefined,
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
      overflow: 'hidden',
      ...props.style
    }}
  >
    {children}
  </div>
);

export const CardHeader = ({ 
  children, 
  bg, 
  ...props 
}: BoxProps) => (
  <div
    {...props}
    style={{
      padding: '1rem 1.5rem',
      borderBottom: '1px solid #E2E8F0',
      backgroundColor: bg,
      ...props.style
    }}
  >
    {children}
  </div>
);

export const CardBody = ({ 
  children, 
  ...props 
}: BoxProps) => (
  <div
    {...props}
    style={{
      padding: '1rem 1.5rem',
      ...props.style
    }}
  >
    {children}
  </div>
);

export const Divider = (props: React.HTMLProps<HTMLHRElement>) => (
  <hr style={{ 
    margin: '1rem 0', 
    borderTop: '1px solid #E2E8F0',
    ...props.style
  }} {...props} />
);

// Typography
interface HeadingProps extends Omit<React.HTMLProps<HTMLHeadingElement>, 'size'> {
  size?: Size;
  mb?: number;
  mt?: number;
  ml?: number;
  mr?: number;
}

export const Heading = ({ 
  children, 
  size = 'md' as Size,
  mb,
  mt,
  ml,
  mr,
  ...props 
}: HeadingProps) => {
  const sizeMap: Record<Size, { element: string; fontSize: string }> = {
    xs: { element: 'h6', fontSize: '0.75rem' },
    sm: { element: 'h5', fontSize: '0.875rem' },
    md: { element: 'h4', fontSize: '1rem' },
    lg: { element: 'h3', fontSize: '1.25rem' },
    xl: { element: 'h2', fontSize: '1.5rem' },
  };

  const { element: Element, fontSize } = sizeMap[size];
  
  return React.createElement(
    Element, 
    { 
      ...props, 
      style: { 
        fontSize, 
        fontWeight: 'bold', 
        margin: '0 0 0.5rem 0',
        marginBottom: mb ? `${mb * 0.25}rem` : undefined,
        marginTop: mt ? `${mt * 0.25}rem` : undefined,
        marginLeft: ml ? `${ml * 0.25}rem` : undefined,
        marginRight: mr ? `${mr * 0.25}rem` : undefined,
        ...props.style 
      } 
    }, 
    children
  );
};

interface TextProps extends Omit<React.HTMLProps<HTMLParagraphElement>, 'fontSize'> {
  fontSize?: Size | string;
  fontWeight?: 'normal' | 'medium' | 'bold';
  mb?: number;
  mt?: number;
  ml?: number; 
  mr?: number;
  color?: string;
  textDecoration?: string;
}

export const Text = ({ 
  children,
  fontSize = 'md' as Size,
  fontWeight,
  mb,
  mt,
  ml,
  mr,
  color,
  textDecoration,
  ...props 
}: TextProps) => {
  const sizeMap: Record<Size, string> = {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
  };
  
  const fontSizeValue = Object.keys(sizeMap).includes(fontSize as string) 
    ? sizeMap[fontSize as Size] 
    : fontSize;
    
  const weightMap = {
    normal: 'normal',
    medium: '500',
    bold: 'bold',
  };

  return (
    <p 
      {...props} 
      style={{ 
        fontSize: fontSizeValue, 
        fontWeight: fontWeight ? weightMap[fontWeight] : 'normal',
        margin: '0 0 0.5rem 0',
        marginBottom: mb ? `${mb * 0.25}rem` : undefined,
        marginTop: mt ? `${mt * 0.25}rem` : undefined,
        marginLeft: ml ? `${ml * 0.25}rem` : undefined,
        marginRight: mr ? `${mr * 0.25}rem` : undefined,
        color: color,
        textDecoration: textDecoration,
        ...props.style
      }}
    >
      {children}
    </p>
  );
};

// Table components
interface TableProps extends React.HTMLProps<HTMLTableElement> {
  variant?: string;
}

export const Table = ({ children, variant, ...props }: TableProps) => (
  <table
    {...props}
    style={{
      width: '100%',
      borderCollapse: 'collapse',
      borderRadius: '8px',
      overflow: 'hidden',
      ...(variant === 'simple' && {
        border: '1px solid #E2E8F0',
      }),
      ...props.style
    }}
  >
    {children}
  </table>
);

export const Thead = ({ children, ...props }: React.HTMLProps<HTMLTableSectionElement>) => (
  <thead {...props}>{children}</thead>
);

export const Tbody = ({ children, ...props }: React.HTMLProps<HTMLTableSectionElement>) => (
  <tbody {...props}>{children}</tbody>
);

interface TrProps extends React.HTMLProps<HTMLTableRowElement> {
  bg?: string;
}

export const Tr = ({ children, bg, ...props }: TrProps) => (
  <tr
    {...props}
    style={{
      backgroundColor: bg,
      ...props.style
    }}
  >
    {children}
  </tr>
);

export const Th = ({ children, ...props }: React.HTMLProps<HTMLTableHeaderCellElement>) => (
  <th
    {...props}
    style={{
      textAlign: 'left',
      padding: '0.75rem',
      borderBottom: '2px solid #E2E8F0',
      fontWeight: 'bold',
      ...props.style
    }}
  >
    {children}
  </th>
);

interface TdProps extends React.HTMLProps<HTMLTableDataCellElement> {
  fontWeight?: string;
}

export const Td = ({ children, fontWeight, ...props }: TdProps) => (
  <td
    {...props}
    style={{
      padding: '0.75rem 1rem',
      borderBottom: '1px solid #E2E8F0',
      fontWeight,
      ...props.style
    }}
  >
    {children}
  </td>
);

// Badge component
interface BadgeProps extends React.HTMLProps<HTMLSpanElement> {
  colorScheme?: ColorScheme;
  mr?: number;
  ml?: number;
  mt?: number;
  mb?: number;
  textDecoration?: string;
}

export const Badge = ({ 
  children, 
  colorScheme = 'gray',
  mr,
  ml,
  mt,
  mb,
  textDecoration,
  ...props 
}: BadgeProps) => {
  const colorMap: Record<ColorScheme, { bg: string, color: string }> = {
    blue: { bg: '#EBF8FF', color: '#3182CE' },
    green: { bg: '#E6FFFA', color: '#38B2AC' },
    red: { bg: '#FFF5F5', color: '#E53E3E' },
    orange: { bg: '#FFFAF0', color: '#DD6B20' },
    purple: { bg: '#FAF5FF', color: '#805AD5' },
    gray: { bg: '#EDF2F7', color: '#718096' },
    yellow: { bg: '#FFFAF0', color: '#D69E2E' }
  };

  const { bg, color } = colorMap[colorScheme];

  return (
    <span
      {...props}
      style={{
        display: 'inline-block',
        padding: '0.25rem 0.5rem',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        borderRadius: '0.375rem',
        backgroundColor: bg,
        color: color,
        marginRight: mr ? `${mr * 0.25}rem` : undefined,
        marginLeft: ml ? `${ml * 0.25}rem` : undefined,
        marginTop: mt ? `${mt * 0.25}rem` : undefined,
        marginBottom: mb ? `${mb * 0.25}rem` : undefined,
        textDecoration,
        ...props.style
      }}
    >
      {children}
    </span>
  );
};

// Spinner component
interface SpinnerProps extends Omit<React.HTMLProps<HTMLDivElement>, 'size'> {
  size?: Size | string;
}

export const Spinner = ({ size = 'md', ...props }: SpinnerProps) => {
  const sizeMap: Record<Size, string> = {
    xs: '0.75rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem'
  };
  
  const spinnerSize = sizeMap[size as Size] || size;
  
  return (
    <div
      {...props}
      style={{
        display: 'inline-block',
        borderRadius: '50%',
        width: spinnerSize,
        height: spinnerSize,
        border: '2px solid rgba(0, 0, 0, 0.1)',
        borderLeftColor: '#3182CE',
        animation: 'spin 1s linear infinite',
        ...props.style
      }}
    />
  );
};

// Add keyframes for spinner
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

// Accordion components
interface AccordionProps extends React.HTMLProps<HTMLDivElement> {
  allowToggle?: boolean;
}

export const Accordion = ({ children, allowToggle, ...props }: AccordionProps) => (
  <div 
    {...props}
    data-allow-toggle={allowToggle}
    style={{
      border: '1px solid #E2E8F0',
      borderRadius: '8px',
      overflow: 'hidden',
      ...props.style
    }}
  >
    {children}
  </div>
);

export const AccordionItem = ({ children, ...props }: React.HTMLProps<HTMLDivElement>) => (
  <div
    {...props}
    style={{
      borderBottom: '1px solid #E2E8F0',
      ...props.style
    }}
  >
    {children}
  </div>
);

export const AccordionButton = ({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    {...props}
    style={{
      display: 'flex',
      width: '100%',
      padding: '1rem',
      textAlign: 'left',
      border: 'none',
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      ...props.style
    }}
  >
    {children}
  </button>
);

export const AccordionPanel = ({ children, ...props }: React.HTMLProps<HTMLDivElement>) => (
  <div
    {...props}
    style={{
      padding: '1rem',
      ...props.style
    }}
  >
    {children}
  </div>
);

export const AccordionIcon = (props: React.HTMLProps<HTMLSpanElement>) => (
  <span
    {...props}
    style={{
      borderStyle: 'solid',
      borderWidth: '0 2px 2px 0',
      display: 'inline-block',
      padding: '3px',
      transform: 'rotate(45deg)',
      ...props.style
    }}
  />
);

// Alert components
interface AlertProps extends React.HTMLProps<HTMLDivElement> {
  status?: Status;
}

export const Alert = ({ children, status = 'info', ...props }: AlertProps) => {
  const colorMap: Record<Status, { bg: string; color: string }> = {
    info: { bg: '#EBF8FF', color: '#3182CE' },
    success: { bg: '#E6FFFA', color: '#38B2AC' },
    warning: { bg: '#FFFAF0', color: '#DD6B20' },
    error: { bg: '#FFF5F5', color: '#E53E3E' },
  };

  const { bg, color } = colorMap[status];

  return (
    <div
      {...props}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '1rem',
        borderRadius: '0.375rem',
        backgroundColor: bg,
        color: color,
        ...props.style
      }}
    >
      {children}
    </div>
  );
};

export const AlertIcon = (props: React.HTMLProps<HTMLSpanElement>) => (
  <span
    {...props}
    role="img"
    aria-label="Alert"
    style={{
      display: 'inline-flex',
      flexShrink: 0,
      marginRight: '0.75rem',
      height: '1.25rem',
      width: '1.25rem',
      ...props.style
    }}
  >
    ⓘ
  </span>
);

export const AlertTitle = ({ 
  children, 
  ...props 
}: React.HTMLProps<HTMLDivElement>) => (
  <div
    {...props}
    style={{
      fontWeight: 'bold',
      marginRight: '0.5rem',
      ...props.style
    }}
  >
    {children}
  </div>
);

export const AlertDescription = ({ 
  children, 
  ...props 
}: React.HTMLProps<HTMLDivElement>) => (
  <div
    {...props}
    style={{
      ...props.style
    }}
  >
    {children}
  </div>
);

export const Code = ({ 
  children, 
  ...props 
}: React.HTMLProps<HTMLElement>) => (
  <code
    {...props}
    style={{
      padding: '0.2em 0.4em',
      borderRadius: '0.25rem',
      fontSize: '0.875em',
      backgroundColor: '#EDF2F7',
      ...props.style
    }}
  >
    {children}
  </code>
);

// Form elements
export const FormControl = ({ 
  children, 
  isRequired, 
  ...props 
}: React.HTMLProps<HTMLDivElement> & { isRequired?: boolean }) => (
  <div style={{ marginBottom: '1rem', ...props.style }} {...props}>
    {children}
  </div>
);

export const FormLabel = ({ 
  children, 
  ...props 
}: React.HTMLProps<HTMLLabelElement>) => (
  <label 
    {...props} 
    style={{ 
      display: 'block', 
      marginBottom: '0.5rem', 
      fontWeight: '500',
      ...props.style
    }}
  >
    {children}
  </label>
);

export const Input = (props: React.HTMLProps<HTMLInputElement>) => (
  <input
    {...props}
    style={{
      width: '100%',
      padding: '0.5rem 1rem',
      fontSize: '1rem',
      border: '1px solid #E2E8F0',
      borderRadius: '0.375rem',
      outline: 'none',
      transition: 'border-color 0.2s',
      ...props.style
    }}
  />
);

export const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    style={{
      width: '100%',
      padding: '0.5rem 1rem',
      fontSize: '1rem',
      border: '1px solid #E2E8F0',
      borderRadius: '0.375rem',
      outline: 'none',
      minHeight: '100px',
      resize: 'vertical',
      transition: 'border-color 0.2s',
      ...props.style
    }}
  />
);

export const Select = ({ children, ...props }: React.HTMLProps<HTMLSelectElement>) => (
  <select
    {...props}
    style={{
      display: 'block',
      width: '100%',
      padding: '0.5rem',
      borderRadius: '0.25rem',
      border: '1px solid #CBD5E0',
      fontSize: '1rem',
      backgroundColor: 'white',
      ...props.style,
    }}
  >
    {children}
  </select>
);

export const Checkbox = ({ 
  children, 
  ...props 
}: React.HTMLProps<HTMLInputElement>) => (
  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
    <input
      type="checkbox"
      {...props}
      style={{
        marginRight: '0.5rem',
        ...props.style,
      }}
    />
    {children}
  </label>
);

// Buttons
interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  colorScheme?: ColorScheme;
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  type?: ButtonType;
  mr?: number;
  mt?: number;
  mb?: number;
  ml?: number;
}

export const Button = ({ 
  children, 
  colorScheme = 'blue', 
  variant = 'solid',
  size = 'md',
  isLoading,
  isDisabled,
  leftIcon,
  rightIcon,
  type = 'button',
  mr,
  mt,
  mb,
  ml,
  ...props 
}: ButtonProps) => {
  const colorStyles: Record<ColorScheme, { bg: string, hover: string, text: string, border: string }> = {
    blue: { bg: '#4299E1', hover: '#3182CE', text: 'white', border: '#4299E1' },
    green: { bg: '#48BB78', hover: '#38A169', text: 'white', border: '#48BB78' },
    red: { bg: '#F56565', hover: '#E53E3E', text: 'white', border: '#F56565' },
    orange: { bg: '#ED8936', hover: '#DD6B20', text: 'white', border: '#ED8936' },
    purple: { bg: '#9F7AEA', hover: '#805AD5', text: 'white', border: '#9F7AEA' },
    gray: { bg: '#A0AEC0', hover: '#718096', text: 'white', border: '#A0AEC0' },
    yellow: { bg: '#ECC94B', hover: '#D69E2E', text: 'white', border: '#ECC94B' }
  };
  
  const sizeMap = {
    xs: { padding: '0.25rem 0.5rem', fontSize: '0.75rem' },
    sm: { padding: '0.375rem 0.75rem', fontSize: '0.875rem' },
    md: { padding: '0.5rem 1rem', fontSize: '1rem' },
    lg: { padding: '0.625rem 1.25rem', fontSize: '1.125rem' },
    xl: { padding: '0.75rem 1.5rem', fontSize: '1.25rem' },
  };
  
  const colors = colorStyles[colorScheme];
  const dimensions = sizeMap[size];
  
  const variantStyles = {
    solid: {
      backgroundColor: colors.bg,
      color: colors.text,
      border: 'none',
    },
    outline: {
      backgroundColor: 'transparent',
      color: colors.bg,
      border: `1px solid ${colors.border}`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.bg,
      border: 'none',
    },
    link: {
      backgroundColor: 'transparent',
      color: colors.bg,
      border: 'none',
      padding: '0',
      textDecoration: 'underline',
    },
  };
  
  return (
    <button
      type={type}
      disabled={isDisabled}
      {...props}
      style={{
        ...dimensions,
        ...variantStyles[variant],
        fontWeight: '500',
        borderRadius: '0.25rem',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isDisabled ? 0.6 : 1,
        marginRight: mr ? `${mr * 0.25}rem` : undefined,
        marginTop: mt ? `${mt * 0.25}rem` : undefined,
        marginBottom: mb ? `${mb * 0.25}rem` : undefined,
        marginLeft: ml ? `${ml * 0.25}rem` : undefined,
        ...props.style,
      }}
    >
      {leftIcon && <span style={{ marginRight: '0.5rem' }}>{leftIcon}</span>}
      {isLoading ? 'Loading...' : children}
      {rightIcon && <span style={{ marginLeft: '0.5rem' }}>{rightIcon}</span>}
    </button>
  );
};

interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
  mr?: number;
  ml?: number;
}

export const IconButton = ({ 
  icon, 
  'aria-label': ariaLabel, 
  mr,
  ml,
  ...props 
}: IconButtonProps) => (
  <Button 
    {...props}
    aria-label={ariaLabel}
    style={{
      padding: '0.5rem',
      borderRadius: '0.375rem',
      marginRight: mr ? `${mr * 0.25}rem` : undefined,
      marginLeft: ml ? `${ml * 0.25}rem` : undefined,
      ...props.style
    }}
  >
    {icon}
  </Button>
);

export const Tooltip = ({ 
  children, 
  label, 
  ...props 
}: React.HTMLProps<HTMLDivElement> & { 
  label: string,
  children: React.ReactElement,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div 
      style={{ 
        position: 'relative', 
        display: 'inline-block',
        ...props.style 
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      {...props}
    >
      {children}
      {showTooltip && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '8px',
          padding: '6px 10px',
          backgroundColor: '#4A5568',
          color: 'white',
          borderRadius: '4px',
          fontSize: '0.875rem',
          whiteSpace: 'nowrap',
          zIndex: 1000,
        }}>
          {label}
        </div>
      )}
    </div>
  );
};

// Number Input Components
interface NumberInputProps extends Omit<React.HTMLProps<HTMLDivElement>, 'onChange'> {
  value: number | string;
  onChange: (valueAsString: string, valueAsNumber: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const NumberInput = ({ 
  children, 
  value,
  onChange,
  min,
  max,
  step = 1,
  ...props 
}: NumberInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valueAsString = e.target.value;
    const valueAsNumber = parseFloat(valueAsString);
    onChange(valueAsString, valueAsNumber);
  };
  
  return (
    <div style={{ position: 'relative', width: '100%' }} {...props}>
      {children}
    </div>
  );
};

export const NumberInputField = (props: React.HTMLProps<HTMLInputElement>) => (
  <input
    type="number"
    {...props}
    style={{
      display: 'block',
      width: '100%',
      padding: '0.5rem',
      borderRadius: '0.25rem',
      border: '1px solid #CBD5E0',
      fontSize: '1rem',
      ...props.style,
    }}
  />
);

export const NumberInputStepper = ({ children, ...props }: React.HTMLProps<HTMLDivElement>) => (
  <div 
    {...props}
    style={{ 
      position: 'absolute', 
      right: '0', 
      top: '0',
      bottom: '0', 
      display: 'flex', 
      flexDirection: 'column',
      width: '24px',
      ...props.style 
    }}
  >
    {children}
  </div>
);

export const NumberIncrementStepper = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    {...props}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderLeft: '1px solid #CBD5E0',
      borderBottom: '1px solid #CBD5E0',
      cursor: 'pointer',
      height: '50%',
      fontSize: '0.875rem',
      ...props.style,
    }}
  >
    ▲
  </button>
);

export const NumberDecrementStepper = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    {...props}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderLeft: '1px solid #CBD5E0',
      cursor: 'pointer',
      height: '50%',
      fontSize: '0.875rem',
      ...props.style,
    }}
  >
    ▼
  </button>
);

// Modal Components
interface ModalProps extends React.HTMLProps<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
}

export const Modal = ({ 
  isOpen, 
  onClose, 
  children,
  ...props 
}: ModalProps) => {
  if (!isOpen) return null;
  
  // Prevent scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
      {...props}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          padding: '1rem',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export const ModalOverlay = (props: React.HTMLProps<HTMLDivElement>) => <div {...props} />;
export const ModalContent = (props: React.HTMLProps<HTMLDivElement>) => <div {...props} />;
export const ModalHeader = (props: React.HTMLProps<HTMLDivElement>) => (
  <div
    {...props}
    style={{ 
      fontWeight: 'bold', 
      fontSize: '1.25rem', 
      marginBottom: '1rem',
      ...props.style 
    }}
  />
);
export const ModalFooter = (props: React.HTMLProps<HTMLDivElement>) => (
  <div
    {...props}
    style={{ 
      display: 'flex', 
      justifyContent: 'flex-end', 
      gap: '0.5rem', 
      marginTop: '1rem',
      ...props.style 
    }}
  />
);
export const ModalBody = (props: React.HTMLProps<HTMLDivElement>) => <div {...props} />;
export const ModalCloseButton = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    {...props}
    style={{
      position: 'absolute',
      top: '0.5rem',
      right: '0.5rem',
      background: 'none',
      border: 'none',
      fontSize: '1.25rem',
      cursor: 'pointer',
      ...props.style
    }}
  >
    ✕
  </button>
); 