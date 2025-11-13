import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import { verifyAccessToken } from "../utils/authTokens";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Authorization header missing",
      });
    }

    const [, token] = authHeader.split(" ");
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Authorization header malformed",
      });
    }

    const payload = await verifyAccessToken(token);

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}
