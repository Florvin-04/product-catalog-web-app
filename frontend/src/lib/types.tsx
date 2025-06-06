export type Response<T> = {
  data: T;
  message: string;
  status: "success" | "error";
};

export type Product = {
  id: number;
  name: string;
  price: number;
  categories: Category[];
};

export type Category = {
  id: number;
  name: string;
};


