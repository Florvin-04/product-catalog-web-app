import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import type { Product } from "@/lib/types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AddEditProductForm from "../form/addEditProductForm";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMutateDeleteProduct } from "@/services/productService";

type TableActionProps = {
  product: Product;
};

const TableAction = (props: TableActionProps) => {
  const [isOpenEditProductModal, setIsOpenEditProductModal] = useState(false);
  const [isOpenDeleteProductModal, setIsOpenDeleteProductModal] =
    useState(false);

  const { mutate: deleteProductMutation, isPending: isDeletingProduct } =
    useMutateDeleteProduct();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsOpenEditProductModal(true)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsOpenDeleteProductModal(true)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={isOpenEditProductModal}
        onOpenChange={setIsOpenEditProductModal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <AddEditProductForm
              product={props.product}
              onClose={() => setIsOpenEditProductModal(false)}
            />
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isOpenDeleteProductModal}
        onOpenChange={setIsOpenDeleteProductModal}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingProduct}>
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={(e) => {
                e.preventDefault();
                deleteProductMutation(props.product.id, {
                  onSuccess: () => {
                    setIsOpenDeleteProductModal(false);
                  },
                });
              }}
              disabled={isDeletingProduct}
              isLoading={isDeletingProduct}
              variant="destructive"
            >
              {isDeletingProduct ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TableAction;
