const { Router } = require("express");
const { auth } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const {
  initiatePayment,
  getPaymentByOrderId,
  submitTransactionId,
  verifyPayment,
  getAllPayments,
  downloadReceipt,
} = require("../controllers/payment.controller");

const router = Router();

// All routes require authentication
router.use(auth);

// Store routes
router.get("/order/:orderId", getPaymentByOrderId);
router.post("/order/:orderId/transaction", authorizeRoles("store"), submitTransactionId);
router.get("/:paymentId/receipt", downloadReceipt);

// Admin routes
router.post("/:orderId/initiate", authorizeRoles("admin"), initiatePayment);
router.post("/:paymentId/verify", authorizeRoles("admin"), verifyPayment);
router.get("/", authorizeRoles("admin"), getAllPayments);

module.exports = router;
