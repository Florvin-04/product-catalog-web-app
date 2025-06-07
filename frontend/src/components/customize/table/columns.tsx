import type { Category } from "@/lib/types";
import type { ColumnDef } from "@tanstack/react-table";
import TableAction from "./tableAction";

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
  },

  {
    accessorKey: "categories",
    header: "Categories",
    cell: ({ row }) => {
      return (
        <div className="whitespace-normal break-words max-w-[90%]">
          {row.original.categories.map((category) => category.name).join(", ")}
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
  },
];
