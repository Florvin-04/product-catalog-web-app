import axiosInstance from "@/lib/axios";
import type { Category, Response } from "@/lib/types";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryFilters,
} from "@tanstack/react-query";

/**
 * @function addCategory
 * @description Adds a new category to the database
 * @param {string} category - The name of the category to add
 * @returns {Promise<Response<Category[]>>} Promise resolving to API response containing the added category
 * @throws {400} If category name is not provided
 * @throws {400} If category already exists
 * @example
 *  Add a new category
 * const response = await addCategory("New Category");
 *
 *  Response structure:
 * {
 *   message: string,
 *   status: "success" | "error",
 *   data: Category[]
 * }
 */
export const addCategory = async (category: string) => {
  const response = await axiosInstance.post("/api/category/add", {
    name: category,
  });
  return response.data;
};

/**
 * @function useAddCategory
 * @description React Query mutation hook for adding a new category
 * @returns {UseMutationResult} React Query mutation object
 *
 * This hook is associated with the addCategory service function and provides:
 * - Optimistic UI updates: Immediately updates the local cache with the new category
 * - Error handling: Logs errors to console
 *
 * The optimistic update works by:
 * 1. Cancelling any ongoing queries for categories
 * 2. Updating the local cache with the new category data
 * 3. Invalidating queries that don't have data yet
 *
 * This provides a smooth user experience by showing the new category immediately
 * while ensuring the server state is eventually consistent.
 *
 * @example
 * const { mutate: addCategory, isLoading } = useAddCategory();
 * addCategory("New Category");
 */
export const useAddCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addCategory,
    onSuccess: async (newCategory) => {
      const queryFilter: QueryFilters = { queryKey: ["categories"] };

      // Cancel ongoing queries to prevent race conditions
      await queryClient.cancelQueries(queryFilter);

      // Optimistically update the cache with new category
      queryClient.setQueriesData<Response<Category[]>>(
        queryFilter,
        (oldData) => {
          if (!oldData || !oldData.data) return oldData;

          const returnValue = {
            ...oldData,
            data: [...oldData.data, ...newCategory.data],
          };

          return returnValue;
        }
      );

      // Invalidate queries that don't have data yet
      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate(query) {
          return !query.state.data;
        },
      });
    },
    onError: (error) => {
      console.log("error", error);
    },
  });
};

/**
 * @function getCategories
 * @description Fetches all categories from the API
 * @returns {Promise<Response<Category[]>>} Promise resolving to API response containing categories
 * @example
 *  Fetch all categories
 * const response = await getCategories();
 *
 *  Response structure:
 * {
 *   message: string,
 *   status: "success" | "error",
 *   data: Category[]
 * }
 */
export const getCategories = async (): Promise<Response<Category[]>> => {
  const response = await axiosInstance.get("/api/categories");
  return response.data;
};

/**
 * @function useGetCategories
 * @description React Query hook for fetching categories. This hook is a wrapper around the getCategories function,
 *              providing caching, automatic refetching, and loading states.
 * @returns {UseQueryResult<Response<Category[]>>} React Query result object containing:
 *          - data: The categories data from the API
 *          - isLoading: Boolean indicating if the initial load is in progress
 *          - isError: Boolean indicating if an error occurred
 *          - error: The error object if an error occurred
 *          - refetch: Function to manually refetch the data
 * @example
 *  Basic usage
 * const { data, isLoading, isError } = useGetCategories();
 *
 *  The hook internally uses the getCategories function to fetch data from the API
 *  and manages the query state using the "categories" query key
 *
 *  Response structure matches getCategories:
 *  {
 *    message: string,
 *    status: "success" | "error",
 *   data: Category[]
 *  }
 */
export const useGetCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
};
