import { getProducts } from "@/services/productService";
import { queryOptions, type UseQueryOptions } from "@tanstack/react-query";

export const createQueryOptions = (params?: unknown, options?: UseQueryOptions) => {
  return queryOptions({
    ...options,
    queryKey: ["products", params],
    queryFn: () => getProducts(),
  });
};
