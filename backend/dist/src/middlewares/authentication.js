"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateAccessToken = (req, res, next) => {
    var _a;
    console.log("authenticateAccessToken");
    //   const accessToken = req?.cookies?.access_token;
    const accessToken = (_a = req === null || req === void 0 ? void 0 : req.cookies) === null || _a === void 0 ? void 0 : _a.access_token;
    if (!accessToken) {
        res.status(401).json({ error: "Access token missing" });
        return;
    }
    // manually parsing the cookies
    //   const cookies =
    //     token?.split(";").reduce((acc, cookie) => {
    //       const [key, value] = cookie.trim().split("=");
    //       acc[key] = value;
    //       return acc;
    //     }, {}) || {};
    try {
        const decoded = jsonwebtoken_1.default.verify(accessToken, "mySecret");
        req.user = decoded;
        next(); // ✅ Token valid, continue
    }
    catch (err) {
        res.status(403).json({ error: "Invalid or expired token" });
        return;
    }
};
exports.authenticateAccessToken = authenticateAccessToken;
