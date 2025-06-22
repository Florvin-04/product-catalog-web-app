import AddProduct from "@/components/customize/AddProductModal";
import CategoryFilter from "@/components/customize/CategoryFilter";
import { columns } from "@/components/customize/table/columns";
import { DataTable } from "@/components/customize/table/data-table";
import { Input } from "@/components/ui/input";
import type { Category } from "@/lib/types";
import { useGetProductsQuery } from "@/services/productService";
import { useState } from "react";

function Dashboard() {
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  const [searchName, setSearchName] = useState("");

  const { data: products, isLoading } = useGetProductsQuery({
    categoryIds:
      selectedCategories.length > 0
        ? selectedCategories.map((cat) => cat.id)
        : undefined,
    name: searchName,
  });

  return (
    <div className="p-8 space-y-4">
      <div className="flex items-center justify-between">
        <CategoryFilter
          onCategoryChange={(categories) => {
            setSelectedCategories(categories);
          }}
        />
        <AddProduct />
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Search by name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        data={products ?? []}
        isLoading={isLoading}
      />
    </div>
  );
}

export default Dashboard;
