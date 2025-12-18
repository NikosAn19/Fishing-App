import express from "express";
import { AuthController } from "../controllers/AuthController";
import {
  googleLoginSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
} from "../schemas/authSchema";
import { requireAuth } from "../../../middleware/requireAuth";
import { authRateLimiter } from "../../../middleware/rateLimiters";
import { ZodSchema } from "zod";

const router = express.Router();
const authController = new AuthController();

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

router.post("/register", authRateLimiter, validate(registerSchema), authController.register.bind(authController));
router.post("/login", authRateLimiter, validate(loginSchema), authController.login.bind(authController));
router.post(
  "/google",
  authRateLimiter,
  validate(googleLoginSchema),
  authController.googleLogin.bind(authController)
);
router.post(
  "/refresh",
  authRateLimiter,
  validate(refreshSchema),
  authController.refreshToken.bind(authController)
);
router.post("/logout", authRateLimiter, validate(refreshSchema), authController.logout.bind(authController));
router.get("/me", requireAuth, authController.me.bind(authController));

export default router;
