import type { ReactElement, ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export interface QueryWrapper {
  client: QueryClient;
  wrapper: (props: { children: ReactNode }) => ReactElement;
}

/** QueryClient isolé par test, sans retry, sans toast global ni timer de nettoyage résiduel. */
export function createQueryWrapper(): QueryWrapper {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
}
