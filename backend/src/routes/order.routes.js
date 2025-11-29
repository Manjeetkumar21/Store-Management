const { Router } = require("express");
const { auth } = require("../middlewares/auth.middleware.js");
const { authorizeRoles } = require("../middlewares/role.middleware.js");
const {
  createOrderFromCart,
  getStoreOrders,
  getOrderById,
  getAllOrders,
  confirmOrder,
  cancelOrder,
  markAsShipped,
  confirmOrderReceived,
} = require("../controllers/order.controller.js");

const router = Router();

// Store user routes
router.post("/", auth, authorizeRoles("store"), createOrderFromCart);
router.get("/my", auth, authorizeRoles("store"), getStoreOrders);
router.get("/:id", auth, getOrderById); // Both store and admin can view
router.patch("/:id/received", auth, authorizeRoles("store"), confirmOrderReceived);

// Admin routes
router.get("/", auth, authorizeRoles("admin"), getAllOrders);
router.patch("/:id/confirm", auth, authorizeRoles("admin"), confirmOrder);
router.patch("/:id/cancel", auth, authorizeRoles("admin"), cancelOrder);
router.patch("/:id/ship", auth, authorizeRoles("admin"), markAsShipped);

module.exports = router;
