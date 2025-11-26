const express = require("express");
const {
  getAdminStats,
  getStoreStats,
} = require("../controllers/stats.controller.js");

const { auth } = require("../middlewares/auth.middleware.js");
const { authorizeRoles } = require("../middlewares/role.middleware.js");

const router = express.Router();

// Admin Dashboard Stats
router.get("/admin/stats", auth, authorizeRoles("admin"), getAdminStats);

// Store Dashboard Stats
router.get("/store/:storeId/stats", auth, authorizeRoles("store"), getStoreStats);
module.exports = router;
