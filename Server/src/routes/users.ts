import express from "express";
const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get("/profile", (req, res) => {
  res.json({ message: "User profile endpoint - Coming soon!" });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put("/profile", (req, res) => {
  res.json({ message: "Update profile endpoint - Coming soon!" });
});

export default router;
















