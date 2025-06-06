import express from "express";
import cors from "cors";
import { db } from "./database/db.js";
import { categories } from "./database/schema/category.js";
import { desc, eq, inArray, sql } from "drizzle-orm";
import { products } from "./database/schema/product.js";
import { productCategories } from "./database/schema/productCategory.js";

const app = express();
const port = 5000;

// 🔽 Disable caching for all responses
app.use((req, res, next) => {
  res.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

app.use(
  cors({
    origin: "http://localhost:5173", // frontend origin
    credentials: true, // if you use cookies or auth headers
  })
);
app.use(express.json());

const reformatCategoryNameInput = (name) => {
  if (!name) return null;

  const lowerCaseName = name.toLowerCase();
  if (
    typeof lowerCaseName === "string" &&
    lowerCaseName.split(" ").length >= 2
  ) {
    return lowerCaseName.split(" ").join("_").trim();
  }
  return lowerCaseName;
};

const reformatCategoryNameResponse = (name) => {
  if (!name) return null;

  const lowerCaseName = name.toLowerCase();
  if (
    typeof lowerCaseName === "string" &&
    lowerCaseName.split("_").length >= 2
  ) {
    return lowerCaseName.split("_").join(" ").trim();
  }
  return lowerCaseName;
};

app.get("/api", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

app.get("/api/products", async (req, res) => {
  let { categoryIds } = req.query;

  console.log({ categoryIds });

//   categoryIds = [1, 4];

  if (categoryIds) {
    console.log("categoryIds", categoryIds);
    categoryIds = JSON.parse(categoryIds);
  }

  console.log({ categoryIds }, "after");

  let matchingProductIds = [];

  if (categoryIds && categoryIds.length > 0) {
    console.log("categoryIdss", categoryIds);
    // Step 1: Find product-category pairs for filter
    const rows = await db
      .select({
        productId: productCategories.productId,
        categoryId: productCategories.categoryId,
      })
      .from(productCategories)
      .where(inArray(productCategories.categoryId, categoryIds));

    // Group by productId and count how many of the required categories it has
    const countMap = new Map();

    for (const row of rows) {
      if (!countMap.has(row.productId)) {
        countMap.set(row.productId, new Set());
      }
      countMap.get(row.productId).add(row.categoryId);
    }

    // Keep only products that matched *all* required categories
    matchingProductIds = Array.from(countMap.entries())
      .filter(([_, catSet]) => categoryIds.every((id) => catSet.has(id)))
      .map(([productId]) => productId);

    if (matchingProductIds.length === 0) {
      return res.json({
        message: "No products found",
        status: "success",
        data: [],
      });
    }
  }

  // Step 2: Fetch all products (matching filter if applied) and ALL of their categories
  let baseQuery = db
    .select({
      product: products,
      category: categories,
    })
    .from(products)
    .innerJoin(productCategories, eq(products.id, productCategories.productId))
    .innerJoin(categories, eq(categories.id, productCategories.categoryId))
    .orderBy(desc(products.createdAt));

  if (categoryIds && categoryIds.length > 0) {
    baseQuery = baseQuery.where(inArray(products.id, matchingProductIds));
  }

  const rows = await baseQuery;

  // Step 3: Group products and include all their categories
  let productMap = new Map();

  for (const row of rows) {
    const product = row.product;
    const category = row.category;

    if (!productMap.has(product.id)) {
      productMap.set(product.id, {
        id: product.id,
        name: product.name,
        price: product.price,
        categories: [],
      });
    }

    productMap.get(product.id).categories.push({
      id: category.id,
      name: reformatCategoryNameResponse(category.name),
    });
  }

  res.json({
    message: "Products fetched successfully",
    status: "success",
    data: Array.from(productMap.values()),
  });
});

app.post("/api/category/add", async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({
      message: "Name is required",
      status: "error",
    });
  }

  const formattedCategoryName = reformatCategoryNameInput(name);

  const existingCategory = await db
    .select()
    .from(categories)
    .where(eq(categories.name, formattedCategoryName));

  if (existingCategory.length > 0) {
    return res.status(400).json({
      message: "Category already exists",
      status: "error",
    });
  }

  const category = await db
    .insert(categories)
    .values({ name: formattedCategoryName })
    .returning({
      id: categories.id,
      name: reformatCategoryNameResponse(categories.name),
    });

  res.json({
    message: "Category added successfully",
    status: "success",
    data: category,
  });
});

app.get("/api/categories", async (req, res) => {
  const allCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
    })
    .from(categories);

  res.json({
    message: "Categories fetched successfully",
    status: "success",
    data: allCategories.map((category) => ({
      id: category.id,
      name: reformatCategoryNameResponse(category.name),
    })),
  });
});

app.post("/api/product/add", async (req, res) => {
  const { name, price, categoryIds } = req.body;

  const existingProduct = await db
    .select()
    .from(products)
    .where(eq(products.name, name));

  if (existingProduct.length > 0) {
    return res.status(400).json({
      message: "Product already exists",
      status: "error",
    });
  }

  //   for (const categoryName of categoryNames) {
  //     const formattedCategoryName = reformatCategoryNameInput(categoryName);

  //     const category = await db
  //       .select()
  //       .from(categories)
  //       .where(eq(categories.name, formattedCategoryName));

  //     if (category.length !== 0) {
  //       categoryIds.push(category[0].id);
  //     }
  //   }

  // Filter only valid/existing category IDs
  const existingCategories = await db
    .select({ id: categories.id })
    .from(categories)
    .where(inArray(categories.id, categoryIds));

  console.log({ existingCategories });

  if (existingCategories.length === 0) {
    return res.status(400).json({
      message: "Category not found",
      status: "error",
    });
  }

  const newProduct = await db.transaction(async (tx) => {
    const [insertedProduct] = await tx
      .insert(products)
      .values({
        name,
        price,
      })
      .returning();

    await tx.insert(productCategories).values(
      categoryIds.map((categoryId) => ({
        productId: insertedProduct.id,
        categoryId,
      }))
    );

    return insertedProduct;
  });

  const productWithCategories = await db
    .select({
      product: products,
      category: categories,
    })
    .from(productCategories)
    .innerJoin(products, eq(products.id, productCategories.productId))
    .innerJoin(categories, eq(categories.id, productCategories.categoryId))
    .where(eq(productCategories.productId, newProduct.id));

  res.json({
    message: "Product added successfully",
    status: "success",
    data: {
      ...newProduct,
      categories: productWithCategories.map((row) => {
        return {
          id: row.category.id,
          name: reformatCategoryNameResponse(row.category.name),
        };
      }),
    },
  });
});

app.put("/api/product", async (req, res) => {
  const { id, name, price } = req.body;

  const existingProduct = await db
    .select()
    .from(products)
    .where(eq(products.id, id));

  if (existingProduct.length === 0) {
    return res.status(404).json({
      message: "Product not found",
      status: "error",
    });
  }

  // Start transaction
  const updatedProduct = await db.transaction(async (tx) => {
    // 1. Update the product fields
    const [product] = await tx
      .update(products)
      .set({
        ...(name && { name }),
        ...(price && { price: Number(price) }),
        updatedAt: new Date(),
      })
      .where(eq(products.id, Number(id)))
      .returning();

    // 2. If categoryIds are provided, update categories
    if (Array.isArray(categoryIds) && categoryIds.length > 0) {
      // Validate categories
      const validCategories = await tx
        .select({ id: categories.id })
        .from(categories)
        .where(inArray(categories.id, categoryIds));

      const validCategoryIds = validCategories.map((cat) => cat.id);

      // Remove old relations
      await tx
        .delete(productCategories)
        .where(eq(productCategories.productId, Number(id)));

      // Add new relations
      await tx.insert(productCategories).values(
        validCategoryIds.map((categoryId) => ({
          productId: Number(id),
          categoryId,
        }))
      );
    }

    return product;
  });

  // 3. Fetch updated categories
  const productWithCategories = await db
    .select({
      product: products,
      category: categories,
    })
    .from(productCategories)
    .innerJoin(products, eq(products.id, productCategories.productId))
    .innerJoin(categories, eq(categories.id, productCategories.categoryId))
    .where(eq(productCategories.productId, Number(id)));

  res.json({
    message: "Product updated successfully",
    status: "success",
    data: {
      ...updatedProduct,
      categories: productWithCategories.map((row) => {
        return {
          id: row.category.id,
          name: reformatCategoryNameResponse(row.category.name),
        };
      }),
    },
  });
});

app.delete("/api/product", async (req, res) => {
  const { id } = req.query;

  // Check if the product exists first
  const existing = await db
    .select()
    .from(products)
    .where(eq(products.id, Number(id)));

  if (existing.length === 0) {
    return res.status(404).json({
      message: "Product not found",
      status: "error",
    });
  }

  const deletedProduct = await db
    .delete(products)
    .where(eq(products.id, id))
    .returning();

  res.json({
    message: "Product deleted successfully",
    status: "success",
    data: deletedProduct,
  });
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
