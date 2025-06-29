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
exports.addCategory = exports.getCategories = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_js_1 = require("../database/db.js");
const category_js_1 = require("../database/schema/category.js");
const reformatCategoryName_js_1 = require("../helpers/reformatCategoryName.js");
/**
 * @function getCategories
 * @description Fetches all categories from the database and returns them in a human-readable format
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message and array of categories
 * @example
 * // Success response:
 * {
 *   "message": "Categories fetched successfully",
 *   "status": "success",
 *   "data": [
 *     {
 *       "id": 1,
 *       "name": "category one"
 *     },
 *     {
 *       "id": 2,
 *       "name": "category two"
 *     }
 *   ]
 * }
 */
const getCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allCategories = yield db_js_1.db
        .select({
        id: category_js_1.categories.id,
        name: category_js_1.categories.name,
    })
        .from(category_js_1.categories);
    res.json({
        message: "Categories fetched successfully",
        status: "success",
        data: allCategories.map((category) => ({
            id: category.id,
            name: (0, reformatCategoryName_js_1.reformatCategoryNameResponse)(category.name),
        })),
    });
});
exports.getCategories = getCategories;
/**
 * @function addCategory
 * @description Adds a new category to the database
 * @param {Object} req.body - Request body
 * @param {string} req.body.name - Name of the category to add
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success/error message and category data
 * @throws {400} If name is not provided
 * @throws {400} If category with same name already exists
 * @example
 *  Request body:
 * {
 *   "name": "New Category"
 * }
 *
 *  Success response:
 * {
 *   "message": "Category added successfully",
 *   "status": "success",
 *   "data": [{
 *     "id": 123,
 *     "name": "new category"
 *   }]
 * }
 *
 *  Error response (missing name):
 * {
 *   "message": "Name is required",
 *   "status": "error"
 * }
 *
 *  Error response (duplicate category):
 * {
 *   "message": "Category already exists",
 *   "status": "error"
 * }
 */
const addCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    const formattedCategoryName = (0, reformatCategoryName_js_1.reformatCategoryNameInput)(name);
    if (!formattedCategoryName) {
        res.status(400).json({
            message: "Invalid category name",
            status: "error",
        });
        return;
    }
    const existingCategory = yield db_js_1.db
        .select()
        .from(category_js_1.categories)
        .where((0, drizzle_orm_1.eq)(category_js_1.categories.name, formattedCategoryName));
    if (existingCategory.length > 0) {
        res.status(400).json({
            message: "Category already exists",
            status: "error",
        });
        return;
    }
    const category = yield db_js_1.db
        .insert(category_js_1.categories)
        .values({ name: formattedCategoryName })
        .returning({
        id: category_js_1.categories.id,
        name: category_js_1.categories.name,
    });
    const response = category.map((c) => ({
        id: c.id,
        name: (0, reformatCategoryName_js_1.reformatCategoryNameResponse)(c.name),
    }));
    res.json({
        message: "Category added successfully",
        status: "success",
        data: response,
    });
});
exports.addCategory = addCategory;
