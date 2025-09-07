import express from "express";
const router = express.Router();

// @desc    Get all catches
// @route   GET /api/catches
// @access  Private
router.get("/", (req, res) => {
  res.json({
    message: "Get catches endpoint",
    data: [
      {
        id: "1",
        species: "Λαβράκι",
        weight: 2.5,
        length: 45,
        location: "Άλιμος",
        date: "2024-01-15",
        photo: "/uploads/catch1.jpg",
      },
      {
        id: "2",
        species: "Τσιπούρα",
        weight: 1.8,
        length: 35,
        location: "Βουλιαγμένη",
        date: "2024-01-14",
        photo: "/uploads/catch2.jpg",
      },
    ],
  });
});

// @desc    Create new catch
// @route   POST /api/catches
// @access  Private
router.post("/", (req, res) => {
  res.json({ message: "Create catch endpoint - Coming soon!" });
});

// @desc    Get single catch
// @route   GET /api/catches/:id
// @access  Private
router.get("/:id", (req, res) => {
  res.json({ message: `Get catch ${req.params.id} - Coming soon!` });
});

// @desc    Update catch
// @route   PUT /api/catches/:id
// @access  Private
router.put("/:id", (req, res) => {
  res.json({ message: `Update catch ${req.params.id} - Coming soon!` });
});

// @desc    Delete catch
// @route   DELETE /api/catches/:id
// @access  Private
router.delete("/:id", (req, res) => {
  res.json({ message: `Delete catch ${req.params.id} - Coming soon!` });
});

export default router;






