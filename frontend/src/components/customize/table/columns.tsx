import type { Category } from "@/lib/types";
import type { ColumnDef } from "@tanstack/react-table";
import TableAction from "./tableAction";
import { Badge } from "@/components/ui/badge";

export type Column = {
  id: number;
  name: string;
  price: number;
  categories: Category[];
};

export const columns: ColumnDef<Column>[] = [
  {
    accessorKey: "name",
    header: "Name",
    size: 50,
  },
  {
    accessorKey: "price",
    header: "Price (PHP)",
    cell: ({ row }) => {
      return row.original.price.toLocaleString("en-US", {
        style: "currency",
        currency: "PHP",
      });
    },
    size: 50,
  },

  {
    accessorKey: "categories",
    header: "Categories",
    cell: ({ row }) => {
      return (
        <div className="whitespace-normal break-words max-w-[90%]">
          <div className="flex items-center gap-1 flex-wrap">
            {row.original.categories.map((category) => (
              <Badge
                key={category.id}
                variant="secondary"
                className="capitalize"
              >
                {/* <span className="text-xs flex justify-center items-center"> */}
                {category.name}
                {/* </span> */}
              </Badge>
            ))}
          </div>
        </div>
      );
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;

      return <TableAction product={product} />;
    },
    size: 10,
  },
];
