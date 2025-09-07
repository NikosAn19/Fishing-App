import express from "express";
const router = express.Router();

// @desc    Get all fishing spots
// @route   GET /api/spots
// @access  Public
router.get("/", (req, res) => {
  res.json({
    message: "Get fishing spots endpoint",
    data: [
      {
        id: "1",
        name: "Άλιμος Μαρίνα",
        description: "Προστατευμένη περιοχή για spinning",
        latitude: 37.9135,
        longitude: 23.7162,
        type: "marina",
        difficulty: "easy",
        species: ["Λαβράκι", "Τσιπούρα"],
        amenities: ["parking", "cafe", "bait_shop"],
      },
      {
        id: "2",
        name: "Βράχια Βουλιαγμένης",
        description: "Βραχώδης ακτή για rock fishing",
        latitude: 37.7942,
        longitude: 23.7733,
        type: "rocks",
        difficulty: "medium",
        species: ["Σαργός", "Λαβράκι", "Σφυρίδα"],
        amenities: ["parking"],
      },
      {
        id: "3",
        name: "Λιμάνι Ραφήνας",
        description: "Λιμάνι με πολλές δυνατότητες",
        latitude: 38.0236,
        longitude: 24.0114,
        type: "port",
        difficulty: "easy",
        species: ["Κεφαλόs", "Γόπα", "Σαργός"],
        amenities: ["parking", "cafe", "wc", "bait_shop"],
      },
    ],
  });
});

// @desc    Create new fishing spot
// @route   POST /api/spots
// @access  Private
router.post("/", (req, res) => {
  res.json({ message: "Create spot endpoint - Coming soon!" });
});

// @desc    Get single spot
// @route   GET /api/spots/:id
// @access  Public
router.get("/:id", (req, res) => {
  res.json({ message: `Get spot ${req.params.id} - Coming soon!` });
});

// @desc    Update spot
// @route   PUT /api/spots/:id
// @access  Private
router.put("/:id", (req, res) => {
  res.json({ message: `Update spot ${req.params.id} - Coming soon!` });
});

// @desc    Delete spot
// @route   DELETE /api/spots/:id
// @access  Private
router.delete("/:id", (req, res) => {
  res.json({ message: `Delete spot ${req.params.id} - Coming soon!` });
});

export default router;






