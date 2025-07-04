import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const authenticateAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("authenticateAccessToken");
  //   const accessToken = req?.cookies?.access_token;

  const accessToken = req?.cookies?.access_token;

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
    const decoded = jwt.verify(accessToken, "mySecret");
    (req as Request & { user?: string | JwtPayload }).user = decoded;

    next(); // ✅ Token valid, continue
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token" });
    return;
  }
};
