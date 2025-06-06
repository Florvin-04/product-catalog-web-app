import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import AddEditProductForm from "./form/addEditProductForm";

const AddProductModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
            <AddEditProductForm onClose={() => setIsOpen(false)} />
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Button onClick={() => setIsOpen(true)}>Add Product</Button>
    </>
  );
};

export default AddProductModal;
