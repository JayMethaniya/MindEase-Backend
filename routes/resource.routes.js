const express = require("express");
const router = express.Router();
const { authAdminOrUser } = require("../middleware/user.middleware");
const resourceController = require("../controllers/resource.controller");

// Get all resources (public)
router.get("/", resourceController.getResources);

// Get resource by ID (public)
router.get("/:id", resourceController.getResourceById);

// Protected routes (require authentication)
router.post("/add", authAdminOrUser, resourceController.createResource);
router.put("/:id", authAdminOrUser, resourceController.updateResource);
router.delete("/delete/:id", authAdminOrUser, resourceController.deleteResource);

module.exports = router;