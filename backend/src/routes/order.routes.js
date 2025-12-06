const { Router } = require("express");
const { auth } = require("../middlewares/auth.middleware.js");
const { authorizeRoles } = require("../middlewares/role.middleware.js");
const {
  createOrderFromCart,
  getStoreOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  confirmOrder,
  updatePaymentStatus,
  updateShippingStatus,
  confirmOrderReceived,
  deleteOrder,
} = require("../controllers/order.controller.js");

const router = Router();

// Store user routes
router.post("/", auth, authorizeRoles("store"), createOrderFromCart);
router.get("/my", auth, authorizeRoles("store"), getStoreOrders);
router.patch("/:id/received", auth, authorizeRoles("store"), confirmOrderReceived);
router.get("/:id", auth, getOrderById); // Both store and admin can view

// Admin routes
router.get("/", auth, authorizeRoles("admin"), getAllOrders);
router.patch("/:id/confirm", auth, authorizeRoles("admin"), confirmOrder);
router.patch("/:id/status", auth, authorizeRoles("admin"), updateOrderStatus);
router.patch("/:id/payment-status", auth, authorizeRoles("admin"), updatePaymentStatus);
router.patch("/:id/shipping-status", auth, authorizeRoles("admin"), updateShippingStatus);
router.delete("/:id", auth, authorizeRoles("admin"), deleteOrder);

module.exports = router;
