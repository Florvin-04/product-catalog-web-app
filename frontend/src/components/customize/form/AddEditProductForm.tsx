import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { AddProductZodSchema, type AddProductSchema } from "@/lib/schema";
import type { Product } from "@/lib/types";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAddCategory, useGetCategories } from "@/services/categoryService";
import {
  useMutateAddProduct,
  useMutateEditProduct,
} from "@/services/productService";

type AddEditProductFormProps = {
  product?: Product;
  onClose?: () => void;
};

const AddEditProductForm = (props: AddEditProductFormProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories, isLoading } = useGetCategories();
  const { mutate: addProductMutation, isPending: isAddingProduct } =
    useMutateAddProduct();

  const { mutate: editProductMutation, isPending: isEditingProduct } =
    useMutateEditProduct();

  const { mutate: addCategoryMutation, isPending: isAddingCategory } =
    useAddCategory();

  const categoriesOptions = categories?.data ?? [];

  const form = useForm<AddProductSchema>({
    resolver: zodResolver(AddProductZodSchema),
    defaultValues: {
      name: props.product?.name ?? "",
      price: props.product?.price ?? 0,
      categories: props.product?.categories ?? [],
    },
  });

  const selectedCategories = form.watch("categories");

  const filteredCategories = categoriesOptions.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const removeCategory = (categoryToRemove: { id: number; name: string }) => {
    form.setValue(
      "categories",
      selectedCategories.filter(
        (category) => category.id !== categoryToRemove.id
      ),
      { shouldDirty: true }
    );
  };

  const onSubmit = (data: AddProductSchema) => {
    const result = AddProductZodSchema.safeParse(data);
    if (!result.success) {
      console.log(result.error);
      return;
    }

    if (props.product) {
      editProductMutation(
        {
          id: props.product.id,
          name: data.name,
          categoryIds: data.categories.map((category) => category.id),
          price: data.price,
        },
        {
          onSuccess: () => {
            if (props.onClose) {
              props.onClose();
            }
          },
        }
      );

      return;
    }

    addProductMutation(
      {
        name: data.name,
        categoryIds: data.categories.map((category) => category.id),
        price: data.price,
      },
      {
        onSuccess: () => {
          if (props.onClose) {
            props.onClose();
          }
        },
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Product Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (PHP)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Product Price"
                  {...field}
                  value={field.value}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    const numberValue = value === "" ? 0 : parseInt(value, 10);
                    field.onChange(numberValue);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categories</FormLabel>
              <FormControl>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between min-h-10 h-auto"
                    >
                      <div className="flex flex-wrap gap-1">
                        {field.value.length === 0 ? (
                          <span className="text-muted-foreground">
                            Select categories...
                          </span>
                        ) : (
                          field.value.map((category) => (
                            <Badge
                              key={category.id}
                              variant="secondary"
                              className="text-xs"
                            >
                              {category.name}
                              <button
                                type="button"
                                className="ml-1 hover:bg-muted rounded-full cursor-pointer hover:text-red-500"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  removeCategory(category);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))
                        )}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <div className="flex items-center border-b px-3">
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <Input
                        placeholder="Search or Add categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                    <div className="max-h-60 overflow-auto p-1">
                      {filteredCategories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center">
                          <p className="py-6 text-center text-sm text-muted-foreground">
                            No categories found.
                          </p>
                          <Button
                            disabled={isAddingCategory || !searchQuery.trim()}
                            isLoading={isAddingCategory}
                            type="button"
                            className="text-center text-sm w-fit"
                            onClick={() => {
                              addCategoryMutation(searchQuery);
                            }}
                          >
                            Add Category.
                          </Button>
                        </div>
                      ) : (
                        filteredCategories.map((category) => {
                          const isSelected = field.value.some(
                            (c) => c.id === category.id
                          );
                          return (
                            <div
                              key={category.id}
                              className={cn(
                                "flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer",
                                isSelected && "bg-accent"
                              )}
                              onClick={() => {
                                if (isSelected) {
                                  field.onChange(
                                    field.value.filter(
                                      (c) => c.id !== category.id
                                    )
                                  );
                                } else {
                                  field.onChange([...field.value, category]);
                                }
                              }}
                            >
                              <Checkbox
                                checked={isSelected}
                                className="pointer-events-none"
                              />
                              <span className="flex-1 capitalize">
                                {category.name}
                              </span>
                              {isSelected && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          disabled={
            isAddingProduct ||
            isLoading ||
            !form.formState.isDirty ||
            isEditingProduct
          }
          isLoading={isAddingProduct || isEditingProduct}
          type="submit"
        >
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default AddEditProductForm;
