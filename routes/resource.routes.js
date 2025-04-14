const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/user.middleware");
const resourceController = require("../controllers/resource.controller");

router.post("/add", authMiddleware.authUser, resourceController.createResource);
router.get("/get", authMiddleware.authUser, resourceController.getResources);
router.delete("/delete/:id", authMiddleware.authUser, resourceController.deleteResource);

module.exports = router;