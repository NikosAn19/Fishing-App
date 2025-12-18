import express from "express";
import { UploadController } from "../controllers/UploadController";
import { requireAuth } from "../../../middleware/requireAuth";
import { validateRequest } from "../../../middleware/validation/validateRequest";
import { signUploadSchema, completeUploadSchema } from "../schemas/uploadSchema";
import { z } from "zod";

const router = express.Router();
const uploadController = new UploadController();

/**
 * @desc    Generate a presigned URL for S3/R2 upload
 * @route   POST /api/uploads/sign
 * @access  Private/Public (depending on req.user helper, but usually requires auth)
 */
router.post(
  "/sign",
  validateRequest(z.object({ body: signUploadSchema })),
  uploadController.signUpload.bind(uploadController)
);

/**
 * @desc    Complete the upload by recording asset in DB
 * @route   POST /api/uploads/complete
 * @access  Private/Public
 */
router.post(
  "/complete",
  validateRequest(z.object({ body: completeUploadSchema })),
  uploadController.completeUpload.bind(uploadController)
);

export default router;
