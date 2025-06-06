import axiosInstance from "@/lib/axios";
import type { Category, Response } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export const addCategory = async (category: string) => {
  const response = await axiosInstance.post("/api/category/add", {
    name: category,
  });
  return response.data;
};

export const getCategories = async (): Promise<Response<Category[]>> => {
  const response = await axiosInstance.get("/api/categories");
  return response.data;
};

export const useGetCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
};
