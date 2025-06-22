import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";
import { useGetCategories } from "@/services/categoryService";
import CategoryBadges from "./CategoryBadges";

type CategoryFilterProps = {
  onCategoryChange?: (categories: Category[]) => void;
  onReset?: () => void;
};

const CategoryFilter = ({ onCategoryChange, onReset }: CategoryFilterProps) => {
  const { data: categories } = useGetCategories();

  const [open, setOpen] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  const handleCategoryChange = (category: Category) => {
    const isSelected = selectedCategories.some(
      (selectedCat) => selectedCat.id === category.id
    );

    if (isSelected) {
      const filteredCategories = selectedCategories.filter(
        (cat) => cat.id !== category.id
      );

      setSelectedCategories(filteredCategories);
      if (onCategoryChange) {
        onCategoryChange(filteredCategories);
      }
    } else {
      const newCategories = [...selectedCategories, category];
      setSelectedCategories(newCategories);
      if (onCategoryChange) {
        onCategoryChange(newCategories);
      }
    }
  };

  return (
    <div className="space-y-2">
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
                    className="capitalize"
                    key={category.id}
                    onSelect={() => {
                      handleCategoryChange(category);
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
        {selectedCategories.length > 0 && onReset && (
          <Button
            variant="ghost"
            className="h-8 px-2 lg:px-3"
            onClick={onReset}
          >
            Reset filters
          </Button>
        )}
      </div>
      <CategoryBadges
        categories={selectedCategories}
        onRemove={(category) => {
          handleCategoryChange(category);
        }}
      />
    </div>
  );
};

export default CategoryFilter;
