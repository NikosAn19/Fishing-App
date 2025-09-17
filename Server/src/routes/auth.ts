import express from "express";
const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post("/register", (req, res) => {
  res.json({ message: "Register endpoint - Coming soon!" });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post("/login", (req, res) => {
  res.json({ message: "Login endpoint - Coming soon!" });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post("/logout", (req, res) => {
  res.json({ message: "Logout endpoint - Coming soon!" });
});

export default router;










