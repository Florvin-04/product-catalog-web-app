import AddProduct from "@/components/customize/AddProductModal";
import { columns } from "@/components/customize/table/columns";
import { DataTable } from "@/components/customize/table/data-table";
import { Button } from "@/components/ui/button";
import { useGetProductsQuery } from "@/services/productService";
import { useGetCategories } from "@/services/categoryService";
import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

function Dashboard() {
  const [selectedCategories, setSelectedCategories] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [open, setOpen] = useState(false);

  const { data: categories } = useGetCategories();
  const { data: products, isLoading } = useGetProductsQuery({
    categoryIds:
      selectedCategories.length > 0
        ? selectedCategories.map((cat) => cat.id)
        : undefined,
  });

  const data = products?.data.map((product) => {
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      categories: product.categories,
    };
  });

  return (
    <div className="p-8 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="min-w-[200px] justify-between"
              >
                {selectedCategories.length > 0
                  ? `${selectedCategories.length} selected`
                  : "Filter by categories"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search categories..." />
                <CommandEmpty>No category found.</CommandEmpty>
                <CommandGroup>
                  {categories?.data.map((category) => (
                    <CommandItem
                      key={category.id}
                      onSelect={() => {
                        const isSelected = selectedCategories.some(
                          (selectedCat) => selectedCat.id === category.id
                        );
                        if (isSelected) {
                          setSelectedCategories(
                            selectedCategories.filter(
                              (selectedCat) => selectedCat.id !== category.id
                            )
                          );
                        } else {
                          setSelectedCategories([
                            ...selectedCategories,
                            category,
                          ]);
                        }
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCategories.some(
                            (selectedCat) => selectedCat.id === category.id
                          )
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {category.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          {selectedCategories.length > 0 && (
            <Button
              variant="ghost"
              className="h-8 px-2 lg:px-3"
              onClick={() => setSelectedCategories([])}
            >
              Reset filters
            </Button>
          )}
        </div>
        <AddProduct />
      </div>

      <div className="flex items-center gap-2">
        {selectedCategories.map((category) => (
          <Badge
            key={category.id}
            variant="secondary"
            className="text-xs flex items-center gap-2 py-[.1rem]"
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-2 w-2 "
              onClick={() => {
                setSelectedCategories(
                  selectedCategories.filter((cat) => cat.id !== category.id)
                );
              }}
              icon={<X className="size-[.6rem]" />}
            />
            <span>{category.name}</span>
          </Badge>
        ))}
      </div>

      <DataTable columns={columns} data={data ?? []} isLoading={isLoading} />
    </div>
  );
}

export default Dashboard;
