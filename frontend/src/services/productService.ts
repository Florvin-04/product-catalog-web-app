/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/lib/axios";
import type { Product, Response } from "@/lib/types";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryFilters,
} from "@tanstack/react-query";
import { toast } from "sonner";

type GetProductsPayload = {
  categoryIds?: number[];
};

type AddProductPayload = {
  name: string;
  categoryIds: number[];
  price: number;
};

type EditProductPayload = {
  id: number;
} & AddProductPayload;

/**
 * @function getProducts
 * @description Fetches products from the API, optionally filtered by category IDs
 * @param {GetProductsPayload} [payload] - Optional payload containing filter parameters
 * @param {number[]} [payload.categoryIds] - Array of category IDs to filter products by
 * @returns {Promise<Response<Product[]>>} Promise resolving to API response containing products
 * @example
 *  Fetch all products
 * const response = await getProducts();
 *
 *  Fetch products in specific categories
 * const response = await getProducts({ categoryIds: [1, 2] });
 *
 *  Response structure:
 * {
 *   message: string,
 *   status: "success" | "error",
 *   data: Product[]
 * }
 */
export const getProducts = async (
  payload?: GetProductsPayload
): Promise<Response<Product[]>> => {
  const response = await axiosInstance.get("/api/products", {
    params: {
      ...payload,
      categoryIds: payload?.categoryIds
        ? JSON.stringify(payload.categoryIds)
        : undefined,
    },
  });
  return response.data;
};

/**
 * @function useGetProductsQuery
 * @description React Query hook that utilizes getProducts to fetch products, optionally filtered by category IDs
 * @param {GetProductsPayload} [payload] - Optional payload containing filter parameters
 * @param {number[]} [payload.categoryIds] - Array of category IDs to filter products by
 * @returns {UseQueryResult<Response<Product[]>>} React Query result object containing:
 * - data: The fetched products data from getProducts
 * - isLoading: Boolean indicating if the getProducts query is in progress
 * - error: Any error that occurred during the getProducts query
 * - status: The current status of the getProducts query
 * @example
 *  Fetch all products using getProducts
 * const { data, isLoading } = useGetProductsQuery();
 *
 *  Fetch products in specific categories using getProducts
 * const { data } = useGetProductsQuery({ categoryIds: [1, 2] });
 *
 *  Response structure (from getProducts):
 * {
 *   data: {
 *     message: string,
 *     status: "success" | "error",
 *     data: Product[]
 *   },
 *   isLoading: boolean,
 *   error: Error | null,
 *   status: 'loading' | 'error' | 'success'
 * }
 */
export const useGetProductsQuery = (payload?: GetProductsPayload) => {
  return useQuery({
    // Use category IDs as part of query key to create unique cache entries
    // for different category filters
    queryKey: ["products", payload?.categoryIds],

    // Query function that calls getProducts API with optional payload
    queryFn: () => getProducts(payload),

    // Set staleTime to Infinity to prevent automatic background refetching
    // since we want to manually control when products data is refreshed
    staleTime: Infinity,
  });
};

/**
 * @function addProduct
 * @description Sends a POST request to add a new product to the database
 * @param {AddProductPayload} payload - The product data to add
 * @param {string} payload.name - Name of the product
 * @param {number} payload.price - Price of the product
 * @param {number[]} payload.categoryIds - Array of category IDs to associate with the product
 * @returns {Promise<Response<Product>>} Promise that resolves to the API response containing:
 * - message: Status message from the server
 * - status: "success" | "error"
 * - data: The newly added product with its associated categories
 * @throws {Error} If the request fails or server returns an error
 * @example
 *  Example usage:
 * const response = await addProduct({
 *   name: "New Product",
 *   price: 19.99,
 *   categoryIds: [1, 2]
 * });
 *
 *  Example response:
 * {
 *   message: "Product added successfully",
 *   status: "success",
 *   data: {
 *     id: 123,
 *     name: "New Product",
 *     price: 19.99,
 *     categories: [
 *       { id: 1, name: "category one" },
 *       { id: 2, name: "category two" }
 *     ]
 *   }
 * }
 */
export const addProduct = async (payload: AddProductPayload) => {
  const response = await axiosInstance.post("/api/product/add", payload);
  return response.data;
};

/**
 * @function useMutateAddProduct
 * @description React Query mutation hook for adding a new product with optimistic updates
 *
 * This hook is associated with the `addProduct` API function and provides:
 * - Optimistic UI updates: Immediately adds the new product to the local cache after the API request completes, without fetching from the server
 * - Automatic cache invalidation: Refreshes the products list after successful addition
 * - Error handling: Displays toast notifications for success/error states
 *
 * The optimistic update works by:
 * 1. Cancelling any ongoing products queries
 * 2. Adding the new product to the beginning of the cached products list
 * 3. If the API call succeeds, the optimistic update is confirmed
 * 4. If the API call fails, the optimistic update is rolled back
 *
 * @returns {UseMutationResult} React Query mutation object with:
 * - mutate: Function to trigger the product addition
 * - isLoading: Boolean indicating if the mutation is in progress
 * - isError: Boolean indicating if the mutation failed
 * - error: Error object if the mutation failed
 *
 * @example
 * const { mutate } = useMutateAddProduct();
 * mutate({
 *   name: "New Product",
 *   price: 19.99,
 *   categoryIds: [1, 2]
 * });
 */
export const useMutateAddProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addProduct,
    onSuccess: async (newProduct) => {
      const queryFilter: QueryFilters = { queryKey: ["products"] };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<Response<Product[]>>(
        queryFilter,
        (oldData) => {
          if (!oldData || !oldData.data) return oldData;

          const returnValue = {
            ...oldData,
            data: [newProduct.data, ...oldData.data],
          };

          return returnValue;
        }
      );

      toast.success("Success", {
        description: "Product added successfully",
      });

      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate(query) {
          return !query.state.data;
        },
      });
    },
    onError: (error: any) => {
      toast.error("Failed", {
        description: error.response?.data.message,
      });
    },
  });
};

/**
 * @function editProduct
 * @description Updates an existing product's details and category associations
 * @param {EditProductPayload} payload - Product data to update
 * @param {number} payload.id - ID of the product to update
 * @param {string} payload.name - New name for the product
 * @param {number} payload.price - New price for the product
 * @param {number[]} payload.categoryIds - Array of category IDs to associate with the product
 * @returns {Promise<Response<Product>>} Promise resolving to the updated product data
 * @throws {Error} If the request fails
 * @example
 *  Example usage:
 * const updatedProduct = await editProduct({
 *   id: 123,
 *   name: "Updated Product",
 *   price: 29.99,
 *   categoryIds: [1, 3]
 * });
 *
 *  Example response:
 * {
 *   "message": "Product updated successfully",
 *   "status": "success",
 *   "data": {
 *     "id": 123,
 *     "name": "Updated Product",
 *     "price": 29.99,
 *     "categories": [
 *       { "id": 1, "name": "category one" },
 *       { "id": 3, "name": "category three" }
 *     ]
 *   }
 * }
 */
export const editProduct = async (payload: EditProductPayload) => {
  const response = await axiosInstance.put("/api/product", payload);
  return response.data;
};

/**
 * @function useMutateEditProduct
 * @description React Query mutation hook for editing a product. Handles optimistic updates
 * and cache management for product edits.
 *
 * This hook is associated with the `editProduct` service function and implements
 * an optimistic update pattern:
 * 1. Immediately updates the local cache with the new product data
 * 2. Sends the update request to the server
 * 3. If successful, shows a success toast and invalidates stale queries
 * 4. If failed, the optimistic update is rolled back automatically by React Query
 *
 *
 * @returns {UseMutationResult<Response<Product>, Error, EditProductPayload>} React Query mutation object with:
 * - mutate: Function to trigger the product edit
 * - isLoading: Boolean indicating if the mutation is in progress
 * - isError: Boolean indicating if the mutation failed
 * - error: Error object if the mutation failed
 * - data: Response object containing the  updatedproduct data on success
 *
 * @example
 * const { mutate } = useMutateEditProduct();
 * mutate({
 *   id: 123,
 *   name: "Updated Product",
 *   price: 29.99,
 *   categoryIds: [1, 3]
 * });
 */
export const useMutateEditProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editProduct,
    onSuccess: async (newProduct) => {
      const queryFilter: QueryFilters = { queryKey: ["products"] };

      // Cancel any ongoing queries to prevent race conditions
      await queryClient.cancelQueries(queryFilter);

      // Optimistically update the products cache
      queryClient.setQueriesData<Response<Product[]>>(
        queryFilter,
        (oldData) => {
          if (!oldData || !oldData.data) return oldData;

          // Map through products and replace the updated one
          return {
            ...oldData,
            data: oldData.data.map((product) =>
              product.id === newProduct.data.id ? newProduct.data : product
            ),
          };
        }
      );

      // Show success notification
      toast.success("Success", {
        description: "Product updated successfully",
      });

      // Invalidate queries that don't have data yet to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate(query) {
          return !query.state.data;
        },
      });
    },
    onError: (error: any) => {
      console.error("Product update failed", error);

      toast.error("Failed", {
        description: error.response?.data.message,
      });
    },
    onSettled: () => {
      console.log("Product update mutation completed");
    },
  });
};

/**
 * @function deleteProduct
 * @description Deletes a product from the database by its ID
 * @param {number} id - The ID of the product to delete
 * @returns {Promise<Response<Product[]>>} A promise that resolves to the response containing the remaining products
 * @throws {Error} If the deletion fails
 * @example
 *  Usage:
 * const response = await deleteProduct(123);
 *
 *  Response data:
 * {
 *   "message": "Product deleted successfully",
 *   "status": "success",
 *   "data": [
 *     {
 *       "id": 1,
 *       "name": "Product One",
 *       "price": 19.99,
 *     },
 *   ]
 * }
 */
export const deleteProduct = async (id: number) => {
  const response = await axiosInstance.delete<Response<Product[]>>(
    "/api/product",
    {
      params: { id },
    }
  );
  return response.data;
};

/**
 * @function useMutateDeleteProduct
 * @description React Query mutation hook for deleting a product with optimistic updates
 *
 * This hook:
 * 1. Uses the deleteProduct service function as its mutationFn
 * 2. Implements optimistic updates by:
 *    - Cancelling any current queries to prevent race conditions
 *    - Immediately removing the deleted product(s) from the cache after the API request completes
 *    - Showing a success toast notification
 *    - Invalidating queries that don't have data yet to ensure fresh data
 * 3. Handles error and settled states for logging and debugging
 *
 * The optimistic update pattern works as follows:
 * - When the mutation is triggered, we immediately update the cache to reflect what the UI should look like after the deletion
 * - If the mutation succeeds, we invalidate stale queries to ensure consistency
 * - If the mutation fails, React Query automatically rolls back the optimistic update
 *
 * @returns {UseMutationResult} React Query mutation object with methods for triggering the deletion
 *
 * @example
 * const { mutate } = useMutateDeleteProduct();
 * mutate(123); // Delete product with ID 123
 */
export const useMutateDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: async (deletedProduct) => {
      const queryFilter: QueryFilters = { queryKey: ["products"] };

      // Cancel any current queries to prevent race conditions
      await queryClient.cancelQueries(queryFilter);

      // Optimistically update the cache by removing the deleted product(s)
      queryClient.setQueriesData<Response<Product[]>>(
        queryFilter,
        (oldData) => {
          if (!oldData || !oldData.data) return oldData;

          // Get IDs of deleted products
          const deletedIds = deletedProduct.data.map((product) => product.id);

          // Return new data with deleted products filtered out
          return {
            ...oldData,
            data: oldData.data.filter(
              (product) => !deletedIds.includes(product.id)
            ),
          };
        }
      );

      // Show success notification
      toast.success("Success", {
        description: "Product deleted successfully",
      });

      // Invalidate queries that don't have data yet to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate(query) {
          return !query.state.data;
        },
      });
    },

    onError: (error: any) => {
      toast.error("Failed", {
        description: error.response?.data.message,
      });
    },
  });
};
