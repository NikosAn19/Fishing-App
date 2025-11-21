import express from "express";
import {
  googleLogin,
  login,
  logout,
  me,
  refreshToken,
  register,
} from "../controllers/authController";
import {
  googleLoginSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
} from "./auth/validators";
import { requireAuth } from "../middleware/requireAuth";
import { authRateLimiter } from "../middleware/rateLimiters";
import { ZodSchema } from "zod";

const router = express.Router();

const validate =
  (schema: ZodSchema) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      return next();
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error?.errors?.[0]?.message ?? "Invalid request payload",
      });
    }
  };

router.post("/register", authRateLimiter, validate(registerSchema), register);
router.post("/login", authRateLimiter, validate(loginSchema), login);
router.post(
  "/google",
  authRateLimiter,
  validate(googleLoginSchema),
  googleLogin
);
router.post(
  "/refresh",
  authRateLimiter,
  validate(refreshSchema),
  refreshToken
);
router.post("/logout", authRateLimiter, validate(refreshSchema), logout);
router.get("/me", requireAuth, me);

export default router;


















