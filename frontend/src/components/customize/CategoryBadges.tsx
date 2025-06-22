import type { Category } from "@/lib/types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { X } from "lucide-react";

type Props = {
  categories: Category[];
  onRemove: (category: Category) => void;
};

const CategoryBadges = (props: Props) => {
  const { categories: selectedCategories, onRemove } = props;

  return (
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
              onRemove(category);
            }}
            icon={<X className="size-[.6rem]" />}
          />
          <span className="capitalize">{category.name}</span>
        </Badge>
      ))}
    </div>
  );
}

export default CategoryBadges;
