"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAuthCookies = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const setAuthCookies = (res, payload = { id: "anonymous" }) => {
    const accessToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || "mySecret", {
        expiresIn: "60s", // 1 minute
    });
    const refreshToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || "mySecret", {
        expiresIn: "7d",
    });
    res.setHeader("Set-Cookie", [
        `access_token=${accessToken}; Path=/; Max-Age=60; HttpOnly; Secure; SameSite=None`,
        `refresh_token=${refreshToken}; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=None`,
    ]);
    return { accessToken, refreshToken };
};
exports.setAuthCookies = setAuthCookies;
