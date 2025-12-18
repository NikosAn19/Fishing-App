import { Request, Response, NextFunction } from "express";
import User, { UserDoc } from "../models/User";
import { verifyAccessToken } from "../utils/authTokens";

declare global {
  namespace Express {
    interface Request {
      user?: UserDoc;
    }
  }
}

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
    console.log(`[AuthMiddleware] Verifying user: ${payload.sub}`);

    let user = null;
    if (payload.sub && payload.sub.startsWith('@')) {
        // Handle Matrix ID in token
        user = await User.findOne({ 'matrix.userId': payload.sub });
    } else {
        // Handle standard Mongo ID
        if (payload.sub && payload.sub.match(/^[0-9a-fA-F]{24}$/)) {
            user = await User.findById(payload.sub);
        } else {
            console.error(`[AuthMiddleware] Invalid ID format in token: ${payload.sub}`);
        }
    }

    if (!user) {
      console.warn(`[AuthMiddleware] User not found for ID: ${payload.sub}`);
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
