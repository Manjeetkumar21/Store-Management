const { Router } = require("express");
const { auth } = require("../middlewares/auth.middleware.js");
const { authorizeRoles } = require("../middlewares/role.middleware.js");
const {
  createOrderFromCart,
  getStoreOrders,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/order.controller.js");

const router = Router();

// Store user routes
router.post("/", auth, authorizeRoles("store"), createOrderFromCart);
router.get("/my", auth, authorizeRoles("store"), getStoreOrders);

// Admin routes
router.get("/", auth, authorizeRoles("admin"), getAllOrders);
router.patch("/:id/status", auth, authorizeRoles("admin"), updateOrderStatus);

module.exports = router;
