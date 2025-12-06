const { Router } = require("express");
const { auth } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const {
  initiatePayment,
  getPaymentByOrderId,
  getPaymentById,
  uploadPaymentReceipt,
  submitTransactionId,
  verifyPayment,
  getAllPayments,
  getStorePayments,
  updatePaymentStatus,
} = require("../controllers/payment.controller");

const router = Router();

// All routes require authentication
router.use(auth);

// Store routes
router.get("/order/:orderId", getPaymentByOrderId);
router.post("/order/:orderId/transaction", authorizeRoles("store"), submitTransactionId);
router.post("/:paymentId/receipt", authorizeRoles("store"), uploadPaymentReceipt);
router.get("/my", authorizeRoles("store"), getStorePayments);

// Admin routes
router.post("/:orderId/initiate", authorizeRoles("admin"), initiatePayment);
router.post("/:paymentId/verify", authorizeRoles("admin"), verifyPayment);
router.patch("/:paymentId/status", authorizeRoles("admin"), updatePaymentStatus);
router.get("/", authorizeRoles("admin"), getAllPayments);
router.get("/:paymentId", getPaymentById);

module.exports = router;
