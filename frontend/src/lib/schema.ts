import { z } from "zod";

export const AddProductZodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().min(0, "Price must be non-negative"),
  categories: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
      }),
      {
        required_error: "Please select at least one category",
      }
    )
    .min(1, "Please select at least one category"),
});

export type AddProductSchema = z.infer<typeof AddProductZodSchema>;
