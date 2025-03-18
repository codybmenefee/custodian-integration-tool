import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from '../common/ErrorBoundary';

interface RouterAdapterProps {
  children: React.ReactNode;
}

/**
 * Router adapter for the application
 * Works in both client-side only mode and static exports
 */
export const RouterAdapter: React.FC<RouterAdapterProps> = ({ children }) => {
  const [mounted, setMounted] = React.useState(false);

  // Only mount the Router component after hydration
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration errors by not rendering at all during SSR
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  // Added ErrorBoundary at router level to catch any errors in the application
  return (
    <BrowserRouter>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </BrowserRouter>
  );
}; 