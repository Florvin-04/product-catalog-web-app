"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.editProduct = exports.addProduct = exports.getProducts = void 0;
const category_js_1 = require("../database/schema/category.js");
const drizzle_orm_1 = require("drizzle-orm");
const product_js_1 = require("../database/schema/product.js");
const productCategory_js_1 = require("../database/schema/productCategory.js");
const reformatCategoryName_js_1 = require("../helpers/reformatCategoryName.js");
const db_js_1 = require("../database/db.js");
const setAuth_js_1 = require("../middlewares/setAuth.js");
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let { categoryIds, name: productNameSearch } = req.query;
    // const { user } = req;
    // console.log("user", user);
    const categoryIdsArray = categoryIds ? JSON.parse(categoryIds) : [];
    // Parse categoryIds if provided
    if (categoryIds) {
        categoryIds = JSON.parse(categoryIds);
    }
    let matchingProductIds = [];
    // If category filter is provided
    if (categoryIds && categoryIds.length > 0) {
        // Step 1: Find product-category pairs for filter
        const rows = yield db_js_1.db
            .select({
            productId: productCategory_js_1.productCategories.productId,
            categoryId: productCategory_js_1.productCategories.categoryId,
        })
            .from(productCategory_js_1.productCategories)
            .where((0, drizzle_orm_1.inArray)(productCategory_js_1.productCategories.categoryId, categoryIdsArray));
        // Group by productId and count how many of the required categories it has
        const countMap = new Map();
        console.log("rows", rows);
        for (const row of rows) {
            if (!countMap.has(row.productId)) {
                countMap.set(row.productId, new Set());
            }
            (_a = countMap.get(row.productId)) === null || _a === void 0 ? void 0 : _a.add(row.categoryId);
        }
        console.log("countMap", countMap);
        console.log("map entries", Array.from(countMap.entries()));
        // Keep only products that matched *all* required categories
        matchingProductIds = Array.from(countMap.entries())
            .filter(([_, catSet]) => categoryIdsArray.every((id) => catSet.has(id)))
            .map(([productId]) => productId);
        console.log("matchingProductIds", matchingProductIds);
        // Return empty array if no products match all categories
        if (matchingProductIds.length === 0) {
            res.json({
                message: "No products found",
                status: "success",
                data: [],
            });
            return;
        }
    }
    // Step 2: Fetch all products (matching filter if applied) and ALL of their categories
    let baseQuery = db_js_1.db
        .select({
        product: product_js_1.products,
        category: category_js_1.categories,
    })
        .from(product_js_1.products)
        .innerJoin(productCategory_js_1.productCategories, (0, drizzle_orm_1.eq)(product_js_1.products.id, productCategory_js_1.productCategories.productId))
        .innerJoin(category_js_1.categories, (0, drizzle_orm_1.eq)(category_js_1.categories.id, productCategory_js_1.productCategories.categoryId))
        .orderBy((0, drizzle_orm_1.desc)(product_js_1.products.createdAt));
    // Apply category filter if provided
    if (categoryIdsArray && categoryIdsArray.length > 0) {
        baseQuery = baseQuery.where((0, drizzle_orm_1.inArray)(product_js_1.products.id, matchingProductIds));
    }
    if (productNameSearch) {
        baseQuery = baseQuery.where((0, drizzle_orm_1.ilike)(product_js_1.products.name, `%${productNameSearch}%`));
    }
    const rows = yield baseQuery;
    const newQuery = yield db_js_1.db
        .select({
        product: product_js_1.products,
        // category: categories,
        productCategory: productCategory_js_1.productCategories,
    })
        .from(product_js_1.products)
        .innerJoin(productCategory_js_1.productCategories, (0, drizzle_orm_1.eq)(product_js_1.products.id, productCategory_js_1.productCategories.productId))
        // .innerJoin(categories, eq(categories.id, productCategories.categoryId))
        .orderBy((0, drizzle_orm_1.desc)(product_js_1.products.createdAt));
    // Step 3: Group products and include all their categories
    let productMap = new Map();
    // console.log("rows", rows);
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
            name: (0, reformatCategoryName_js_1.reformatCategoryNameResponse)(category.name),
        });
    }
    // console.log("productMap", productMap.values());
    // Return success response with products data
    res.json({
        message: "Products fetched successfully",
        status: "success",
        data: Array.from(productMap.values()),
    });
});
exports.getProducts = getProducts;
/**
 * @function addProduct
 * @description Adds a new product to the database with associated categories
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} req.body.name - Name of the product
 * @param {number} req.body.price - Price of the product
 * @param {number[]} req.body.categoryIds - Array of category IDs to associate with the product
 * @returns {Object} JSON response with success/error message and product data
 * @throws {400} If product already exists
 * @throws {400} If no valid categories are found
 * @example
 * // Request body:
 * {
 *   "name": "New Product",
 *   "price": 19.99,
 *   "categoryIds": [1, 2]
 * }
 *
 * // Success response:
 * {
 *   "message": "Product added successfully",
 *   "status": "success",
 *   "data": {
 *     "id": 123,
 *     "name": "New Product",
 *     "price": 19.99,
 *     "categories": [
 *       { "id": 1, "name": "category one" },
 *       { "id": 2, "name": "category two" }
 *     ]
 *   }
 * }
 */
const addProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, price, categoryIds } = req.body;
    // Check if product with same name already exists
    const existingProduct = yield db_js_1.db
        .select()
        .from(product_js_1.products)
        .where((0, drizzle_orm_1.eq)(product_js_1.products.name, name));
    if (existingProduct.length > 0) {
        res.status(400).json({
            message: "Product already exists",
            status: "error",
        });
        return;
    }
    // Validate that provided category IDs exist in database
    const existingCategories = yield db_js_1.db
        .select({ id: category_js_1.categories.id })
        .from(category_js_1.categories)
        .where((0, drizzle_orm_1.inArray)(category_js_1.categories.id, categoryIds));
    if (existingCategories.length === 0) {
        res.status(400).json({
            message: "Category not found",
            status: "error",
        });
        return;
    }
    /*
  
    utilizing transaction function to ensure atomic updates
  
    if one fails, the entire transaction is rolled back to ensure data integrity
  
    */
    const newProduct = yield db_js_1.db.transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Insert new product
        const [insertedProduct] = yield tx
            .insert(product_js_1.products)
            .values({
            name,
            price,
        })
            .returning();
        // Create product-category associations
        yield tx.insert(productCategory_js_1.productCategories).values(categoryIds.map((categoryId) => ({
            productId: insertedProduct.id,
            categoryId,
        })));
        return insertedProduct;
    }));
    // Fetch the newly created product with its associated categories
    const productWithCategories = yield db_js_1.db
        .select({
        product: product_js_1.products,
        category: category_js_1.categories,
    })
        .from(productCategory_js_1.productCategories)
        .innerJoin(product_js_1.products, (0, drizzle_orm_1.eq)(product_js_1.products.id, productCategory_js_1.productCategories.productId))
        .innerJoin(category_js_1.categories, (0, drizzle_orm_1.eq)(category_js_1.categories.id, productCategory_js_1.productCategories.categoryId))
        .where((0, drizzle_orm_1.eq)(productCategory_js_1.productCategories.productId, newProduct.id));
    (0, setAuth_js_1.setAuthCookies)(res, { id: newProduct.id.toString() });
    // Return success response with product data
    res.json({
        message: "Product added successfully",
        status: "success",
        data: Object.assign(Object.assign({}, newProduct), { categories: productWithCategories.map((row) => {
                return {
                    id: row.category.id,
                    name: (0, reformatCategoryName_js_1.reformatCategoryNameResponse)(row.category.name),
                };
            }) }),
    });
});
exports.addProduct = addProduct;
/**
 * @function editProduct
 * @description Updates an existing product and its category associations
 * @param {Object} req.body - Request body containing product details
 * @param {number} req.body.id - ID of the product to update
 * @param {string} req.body.name - New name for the product (optional)
 * @param {number} req.body.price - New price for the product (optional)
 * @param {number[]} req.body.categoryIds - Array of category IDs to associate with the product
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated product data or error message
 * @throws {404} If product not found
 * @throws {400} If no valid categories are found
 *
 * @example
 *  Request body example
 * {
 *   "id": 1,
 *   "name": "Updated Product",
 *   "price": 19.99,
 *   "categoryIds": [2, 3]
 * }
 *
 * @example
 *  Success response
 * {
 *   "message": "Product updated successfully",
 *   "status": "success",
 *   "data": {
 *     "id": 1,
 *     "name": "Updated Product",
 *     "price": 19.99,
 *     "categories": [
 *       { "id": 2, "name": "Category 2" },
 *       { "id": 3, "name": "Category 3" }
 *     ]
 *   }
 * }
 *
 * @example
 *  Error response
 * {
 *   "message": "Product not found",
 *   "status": "error"
 * }
 */
const editProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, name, price, categoryIds } = req.body;
    const existingProduct = yield db_js_1.db
        .select()
        .from(product_js_1.products)
        .where((0, drizzle_orm_1.eq)(product_js_1.products.id, id));
    if (existingProduct.length === 0) {
        res.status(404).json({
            message: "Product not found",
            status: "error",
        });
        return;
    }
    /*
  
    utilizing transaction function to ensure atomic updates
  
    if one fails, the entire transaction is rolled back to ensure data integrity
  
    */
    const updatedProduct = yield db_js_1.db.transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // 1. Update the product fields
        const [product] = yield tx
            .update(product_js_1.products)
            .set(Object.assign(Object.assign(Object.assign({}, (name && { name })), (price && { price: Number(price) })), { updatedAt: new Date() }))
            .where((0, drizzle_orm_1.eq)(product_js_1.products.id, Number(id)))
            .returning();
        // 2. If categoryIds are provided, update categories
        if (Array.isArray(categoryIds) && categoryIds.length > 0) {
            // Validate categories
            const validCategories = yield tx
                .select({ id: category_js_1.categories.id })
                .from(category_js_1.categories)
                .where((0, drizzle_orm_1.inArray)(category_js_1.categories.id, categoryIds));
            const validCategoryIds = validCategories.map((cat) => cat.id);
            // Remove old relations
            yield tx
                .delete(productCategory_js_1.productCategories)
                .where((0, drizzle_orm_1.eq)(productCategory_js_1.productCategories.productId, Number(id)));
            // Add new relations
            yield tx.insert(productCategory_js_1.productCategories).values(validCategoryIds.map((categoryId) => ({
                productId: Number(id),
                categoryId,
            })));
        }
        return product;
    }));
    // 3. Fetch updated categories
    const productWithCategories = yield db_js_1.db
        .select({
        product: product_js_1.products,
        category: category_js_1.categories,
    })
        .from(productCategory_js_1.productCategories)
        .innerJoin(product_js_1.products, (0, drizzle_orm_1.eq)(product_js_1.products.id, productCategory_js_1.productCategories.productId))
        .innerJoin(category_js_1.categories, (0, drizzle_orm_1.eq)(category_js_1.categories.id, productCategory_js_1.productCategories.categoryId))
        .where((0, drizzle_orm_1.eq)(productCategory_js_1.productCategories.productId, Number(id)));
    res.json({
        message: "Product updated successfully",
        status: "success",
        data: Object.assign(Object.assign({}, updatedProduct), { categories: productWithCategories.map((row) => {
                return {
                    id: row.category.id,
                    name: (0, reformatCategoryName_js_1.reformatCategoryNameResponse)(row.category.name),
                };
            }) }),
    });
});
exports.editProduct = editProduct;
/**
 * @function deleteProduct
 * @description Deletes a product from the database by ID
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.id - ID of the product to delete
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success/error message and deleted product data
 * @throws {404} If product with given ID is not found
 * @example
 *  Request:
 *  DELETE /api/product?id=123
 *
 *  Success response:
 * {
 *   "message": "Product deleted successfully",
 *   "status": "success",
 *   "data": [{
 *     "id": 123,
 *     "name": "Deleted Product",
 *     "price": 19.99
 *   }]
 * }
 *
 *  Error response:
 * {
 *   "message": "Product not found",
 *   "status": "error"
 * }
 */
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.query;
    const existing = yield db_js_1.db
        .select()
        .from(product_js_1.products)
        .where((0, drizzle_orm_1.eq)(product_js_1.products.id, Number(id)));
    if (existing.length === 0) {
        res.status(404).json({
            message: "Product not found",
            status: "error",
        });
        return;
    }
    const deletedProduct = yield db_js_1.db
        .delete(product_js_1.products)
        .where((0, drizzle_orm_1.eq)(product_js_1.products.id, Number(id)))
        .returning();
    res.json({
        message: "Product deleted successfully",
        status: "success",
        data: deletedProduct,
    });
});
exports.deleteProduct = deleteProduct;
