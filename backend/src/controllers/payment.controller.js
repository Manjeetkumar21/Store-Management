const Payment = require("../../models/payment.model");
const Order = require("../../models/order.model");
const { successResponse, errorResponse } = require("../utils/responseHandler");

// INITIATE PAYMENT (Created when order is confirmed by admin)
const initiatePayment = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return errorResponse(res, 403, "Only admin can initiate payment");
    }

    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return errorResponse(res, 404, "Order not found");
    }

    if (order.status !== "confirmed") {
      return errorResponse(res, 400, "Order must be confirmed before initiating payment");
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ orderId });
    if (existingPayment) {
      return errorResponse(res, 400, "Payment already initiated for this order");
    }

    const payment = await Payment.create({
      orderId,
      amount: order.totalAmount,
      paymentMethod: "qr_code",
      status: "pending",
      qrCodeUrl: process.env.PAYMENT_QR_URL || "https://example.com/qr-code.png",
    });

    // Update order with payment reference
    order.paymentId = payment._id;
    await order.save();

    return successResponse(res, 201, "Payment initiated successfully", payment);
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// GET PAYMENT BY ORDER ID
const getPaymentByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const payment = await Payment.findOne({ orderId }).populate("orderId verifiedBy");
    if (!payment) {
      return errorResponse(res, 404, "Payment not found");
    }

    // Check authorization
    if (req.role === "store") {
      const order = await Order.findById(orderId);
      if (!order || !order.storeId.equals(req.user.id)) {
        return errorResponse(res, 403, "Not authorized to view this payment");
      }
    }

    return successResponse(res, 200, "Payment fetched successfully", payment);
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// GET PAYMENT BY ID
const getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId)
      .populate({
        path: "orderId",
        populate: { path: "storeId", select: "name email location" },
      })
      .populate("verifiedBy", "name email");

    if (!payment) {
      return errorResponse(res, 404, "Payment not found");
    }

    // Check authorization
    if (req.role === "store") {
      const order = await Order.findById(payment.orderId);
      if (!order || !order.storeId.equals(req.user.id)) {
        return errorResponse(res, 403, "Not authorized to view this payment");
      }
    }

    return successResponse(res, 200, "Payment fetched successfully", payment);
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// SUBMIT TRANSACTION ID (Store submits after payment)
const submitTransactionId = async (req, res) => {
  try {
    if (req.role !== "store") {
      return errorResponse(res, 403, "Only store users can submit transaction ID");
    }

    const { orderId } = req.params;
    const { transactionId } = req.body;

    if (!transactionId) {
      return errorResponse(res, 400, "Transaction ID is required");
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return errorResponse(res, 404, "Order not found");
    }

    if (!order.storeId.equals(req.user.id)) {
      return errorResponse(res, 403, "Not authorized to update this payment");
    }

    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return errorResponse(res, 404, "Payment not found");
    }

    if (payment.status === "verified") {
      return errorResponse(res, 400, "Payment already verified");
    }

    payment.transactionId = transactionId;
    payment.status = "submitted";
    payment.paidAt = new Date();
    await payment.save();

    // Update order payment status
    order.paymentStatus = "submitted";
    await order.save();

    return successResponse(res, 200, "Transaction ID submitted successfully", payment);
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// VERIFY PAYMENT (Admin verifies payment)
const verifyPayment = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return errorResponse(res, 403, "Only admin can verify payment");
    }

    const { paymentId } = req.params;
    const { verified, notes } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return errorResponse(res, 404, "Payment not found");
    }

    if (payment.status !== "submitted") {
      return errorResponse(res, 400, "Payment must be submitted before verification");
    }

    if (verified) {
      payment.status = "verified";
      payment.verifiedBy = req.user._id;
      payment.verifiedAt = new Date();
      payment.notes = notes || "";

      // Update order payment status
      await Order.findByIdAndUpdate(payment.orderId, {
        paymentStatus: "verified",
        shippingStatus: "processing",
      });
    } else {
      payment.status = "failed";
      payment.notes = notes || "Payment verification failed";

      // Update order payment status
      await Order.findByIdAndUpdate(payment.orderId, {
        paymentStatus: "failed",
      });
    }

    await payment.save();

    return successResponse(res, 200, "Payment verification completed", payment);
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// GET ALL PAYMENTS (Admin only)
const getAllPayments = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return errorResponse(res, 403, "Only admin can view all payments");
    }

    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const payments = await Payment.find(filter)
      .populate({
        path: "orderId",
        populate: { path: "storeId", select: "name email location" },
      })
      .populate("verifiedBy", "name email")
      .sort({ createdAt: -1 });

    return successResponse(res, 200, "Payments fetched successfully", payments);
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// DOWNLOAD RECEIPT (Both store and admin)
const downloadReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId).populate({
      path: "orderId",
      populate: { path: "storeId products.productId" },
    });

    if (!payment) {
      return errorResponse(res, 404, "Payment not found");
    }

    if (payment.status !== "verified") {
      return errorResponse(res, 400, "Payment must be verified to download receipt");
    }

    // Check authorization
    if (req.role === "store") {
      const order = await Order.findById(payment.orderId);
      if (!order || !order.storeId.equals(req.user.id)) {
        return errorResponse(res, 403, "Not authorized to download this receipt");
      }
    }

    // Generate receipt data
    const receiptData = {
      receiptNumber: `RCP-${payment._id.toString().slice(-8).toUpperCase()}`,
      paymentId: payment._id,
      transactionId: payment.transactionId,
      amount: payment.amount,
      paymentDate: payment.paidAt,
      verifiedDate: payment.verifiedAt,
      order: payment.orderId,
    };

    return successResponse(res, 200, "Receipt data generated", receiptData);
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

module.exports = {
  initiatePayment,
  getPaymentByOrderId,
  getPaymentById,
  submitTransactionId,
  verifyPayment,
  getAllPayments,
  downloadReceipt,
};
