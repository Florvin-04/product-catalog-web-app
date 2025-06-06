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

export const getProducts = async (
  payload?: GetProductsPayload
): Promise<Response<Product[]>> => {
  console.log({ payload });
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

export const useGetProductsQuery = (payload?: GetProductsPayload) => {
  return useQuery({
    queryKey: ["products", payload?.categoryIds],
    queryFn: () => getProducts(payload),
    staleTime: Infinity,
  });
};

export const addProduct = async (payload: AddProductPayload) => {
  const response = await axiosInstance.post("/api/product/add", payload);
  return response.data;
};

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

          console.log("returnValue", returnValue);

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
  });
};

export const editProduct = async (payload: EditProductPayload) => {
  const response = await axiosInstance.put("/api/product", payload);
  return response.data;
};

export const useMutateEditProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editProduct,
    onSuccess: async (newProduct) => {
      const queryFilter: QueryFilters = { queryKey: ["products"] };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<Response<Product[]>>(
        queryFilter,
        (oldData) => {
          if (!oldData || !oldData.data) return oldData;

          const returnValue = {
            ...oldData,
            data: oldData.data.map((product) =>
              product.id === newProduct.data.id ? newProduct.data : product
            ),
          };

          console.log("returnValue", returnValue);

          return returnValue;
        }
      );

      toast.success("Success", {
        description: "Product updated successfully",
      });

      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate(query) {
          return !query.state.data;
        },
      });
    },
    onError: (error) => {
      console.error("onError", error);
    },
    onSettled: () => {
      console.log("Mutation settled");
    },
  });
};

export const deleteProduct = async (id: number) => {
  const response = await axiosInstance.delete<Response<Product[]>>(
    "/api/product",
    {
      params: { id },
    }
  );
  return response.data;
};

export const useMutateDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: async (deletedProduct) => {
      const queryFilter: QueryFilters = { queryKey: ["products"] };

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<Response<Product[]>>(
        queryFilter,
        (oldData) => {
          if (!oldData || !oldData.data) return oldData;

          const deletedIds = deletedProduct.data.map((product) => product.id);

          const returnValue = {
            ...oldData,
            data: oldData.data.filter(
              (product) => !deletedIds.includes(product.id)
            ),
          };

          return returnValue;
        }
      );

      toast.success("Success", {
        description: "Product deleted successfully",
      });

      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate(query) {
          return !query.state.data;
        },
      });
    },

    onError: (error) => {
      console.error("onError", error);
    },
    onSettled: () => {
      console.log("Mutation settled");
    },
  });
};
