const express = require("express");
const router = express.Router();
const supportGroupModel = require("../model/supportGroup.model");
const authMiddleware = require("../middleware/user.middleware");

// Get active support groups
router.get("/active", async (req, res) => {
  try {
    const activeGroups = await supportGroupModel
      .find({ isActive: true })
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(activeGroups);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching active support groups",
        error: error.message,
      });
  }
});

module.exports = router;
