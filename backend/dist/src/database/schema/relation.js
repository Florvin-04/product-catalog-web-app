"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productCategoryRelations = exports.categoryRelations = exports.productRelations = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const product_js_1 = require("./product.js");
const category_js_1 = require("./category.js");
const productCategory_js_1 = require("./productCategory.js");
exports.productRelations = (0, drizzle_orm_1.relations)(product_js_1.products, ({ many }) => ({
    categories: many(productCategory_js_1.productCategories),
}));
exports.categoryRelations = (0, drizzle_orm_1.relations)(category_js_1.categories, ({ many }) => ({
    products: many(productCategory_js_1.productCategories),
}));
exports.productCategoryRelations = (0, drizzle_orm_1.relations)(productCategory_js_1.productCategories, ({ one }) => ({
    product: one(product_js_1.products, {
        fields: [productCategory_js_1.productCategories.productId],
        references: [product_js_1.products.id],
    }),
    category: one(category_js_1.categories, {
        fields: [productCategory_js_1.productCategories.categoryId],
        references: [category_js_1.categories.id],
    }),
}));
