import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider as ReactQueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const QueryClientProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ReactQueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      {children}
    </ReactQueryClientProvider>
  );
};

export default QueryClientProvider;
