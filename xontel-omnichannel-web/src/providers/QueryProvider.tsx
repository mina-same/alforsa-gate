import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Create a client for the app
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Refetch stale data when window regains focus
      refetchOnWindowFocus: true,
      // Refetch stale data when component mounts
      refetchOnMount: true,
      // Retry failed requests once
      retry: 1,
      // Default stale time is 5 minutes
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * Query Provider Component
 * Wraps the app with React Query provider
 */
export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export default QueryProvider;
