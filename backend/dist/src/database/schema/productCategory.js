"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productCategories = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const product_js_1 = require("./product.js");
const category_js_1 = require("./category.js");
exports.productCategories = (0, pg_core_1.pgTable)("product_categories", {
    productId: (0, pg_core_1.integer)("product_id")
        .notNull()
        .references(() => product_js_1.products.id, { onDelete: "cascade" }),
    categoryId: (0, pg_core_1.integer)("category_id")
        .notNull()
        .references(() => category_js_1.categories.id, { onDelete: "cascade" }),
}, (table) => ({
    pk: (0, pg_core_1.primaryKey)(table.productId, table.categoryId),
}));
