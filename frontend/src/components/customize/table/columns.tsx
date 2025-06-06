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
    header: "Price",
  },
  {
    accessorKey: "categories",
    header: "Categories",
    cell: ({ row }) => {
      return row.original.categories
        .map((category) => category.name)
        .join(", ");
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
