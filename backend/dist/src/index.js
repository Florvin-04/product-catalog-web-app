"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const categoryController_js_1 = require("./controllers/categoryController.js");
const productController_js_1 = require("./controllers/productController.js");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const authentication_1 = require("./middlewares/authentication");
const app = (0, express_1.default)();
const port = 5000;
const allowedOrigins = ["http://localhost:5173"];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        console.log("=== CORS Check ===");
        console.log("Origin:", origin);
        // console.log("Request method:", req?.method);
        // console.log("Request headers:", req?.headers);
        console.log("==================");
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Blocked by CORS: Origin not allowed"));
        }
    },
    credentials: true,
}));
// 🔽 Disable caching for all responses
app.use((req, res, next) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    next();
});
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)()); // 👈 adds req.cookies
app.get("/api", (req, res) => {
    res.json({ message: "Hello from backend!" });
});
/*

Product Routes
- GET /api/products: Fetch all products, optionally filtered by category IDs

- POST /api/product/add: Create a new product with name, price, and category associations

- PUT /api/product: Update an existing product's details and category associations

- DELETE /api/product: Delete a product by ID

*/
app.get("/api/products", authentication_1.authenticateAccessToken, productController_js_1.getProducts);
app.post("/api/product/add", productController_js_1.addProduct);
app.put("/api/product", productController_js_1.editProduct);
app.delete("/api/product", productController_js_1.deleteProduct);
/*

Category Routes

- POST /api/category/add: Create a new category with a name

- GET /api/categories: Fetch all categories

*/
app.post("/api/category/add", categoryController_js_1.addCategory);
app.get("/api/categories", categoryController_js_1.getCategories);
app.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`);
});
