const { Payment, Order } = require("../../models/firestore");
const { formatDoc, formatDocs } = require("../../util/firestore-helpers");
const { successResponse, errorResponse } = require("../utils/responseHandler");

// INITIATE PAYMENT (Created when order is confirmed by admin)
const initiatePayment = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return errorResponse(res, 403, "Only admin can initiate payment");
    }

    const { orderId } = req.params;

    const order = await Order.findOne({ id: orderId });
    if (!order) {
      return errorResponse(res, 404, "Order not found");
    }

    const orderData = order.getData();
    if (orderData.status !== "confirmed") {
      return errorResponse(res, 400, "Order must be confirmed before initiating payment");
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ where: { orderId } });
    if (existingPayment) {
      return errorResponse(res, 400, "Payment already initiated for this order");
    }

    const payment = await Payment.create({
      orderId,
      amount: orderData.totalAmount,
      paymentMethod: "qr_code",
      status: "pending",
      qrCodeUrl: process.env.PAYMENT_QR_URL || "https://example.com/qr-code.png",
    });

    // Update order with payment reference
    await order.update({ paymentId: payment.getId() });

    return successResponse(res, 201, "Payment initiated successfully", formatDoc(payment));
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// GET PAYMENT BY ORDER ID
const getPaymentByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const payment = await Payment.findOne({ where: { orderId } });
    if (!payment) {
      return errorResponse(res, 404, "Payment not found");
    }

    const paymentData = formatDoc(payment);

    // Populate order
    if (paymentData.orderId) {
      const order = await Order.findOne({ id: paymentData.orderId });
      if (order) {
        paymentData.orderId = formatDoc(order);
      }
    }

    // Check authorization
    if (req.role === "store") {
      const order = await Order.findOne({ id: orderId });
      if (!order || order.getData().storeId !== req.user.id) {
        return errorResponse(res, 403, "Not authorized to view this payment");
      }
    }

    return successResponse(res, 200, "Payment fetched successfully", paymentData);
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// GET PAYMENT BY ID
const getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findOne({ id: paymentId });
    if (!payment) {
      return errorResponse(res, 404, "Payment not found");
    }

    const paymentData = formatDoc(payment);

    // Populate order
    if (paymentData.orderId) {
      const order = await Order.findOne({ id: paymentData.orderId });
      if (order) {
        paymentData.orderId = formatDoc(order);
      }
    }

    // Check authorization
    if (req.role === "store") {
      const order = await Order.findOne({ id: paymentData.orderId });
      if (!order || order.getData().storeId !== req.user.id) {
        return errorResponse(res, 403, "Not authorized to view this payment");
      }
    }

    return successResponse(res, 200, "Payment fetched successfully", paymentData);
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// GET ALL PAYMENTS (ADMIN)
const getAllPayments = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return errorResponse(res, 403, "Only admin can view all payments");
    }

    const payments = await Payment.findAll();
    const paymentsData = formatDocs(payments).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    return successResponse(res, 200, "Payments fetched successfully", paymentsData);
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// UPLOAD PAYMENT RECEIPT (STORE)
const uploadPaymentReceipt = async (req, res) => {
  try {
    if (req.role !== "store") {
      return errorResponse(res, 403, "Only store can upload payment receipt");
    }

    const { paymentId } = req.params;
    const { receiptUrl, transactionId } = req.body;

    if (!receiptUrl) {
      return errorResponse(res, 400, "Receipt URL is required");
    }

    const payment = await Payment.findOne({ id: paymentId });
    if (!payment) {
      return errorResponse(res, 404, "Payment not found");
    }

    const paymentData = payment.getData();

    // Verify payment belongs to store's order
    const order = await Order.findOne({ id: paymentData.orderId });
    if (!order || order.getData().storeId !== req.user.id) {
      return errorResponse(res, 403, "Not authorized to update this payment");
    }

    // Update payment with receipt
    await payment.update({
      receiptUrl,
      transactionId: transactionId || paymentData.transactionId,
      status: "submitted",
    });

    const updated = await Payment.findOne({ id: paymentId });
    return successResponse(res, 200, "Payment receipt uploaded successfully", formatDoc(updated));
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// VERIFY PAYMENT (ADMIN)
const verifyPayment = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return errorResponse(res, 403, "Only admin can verify payment");
    }

    const { paymentId } = req.params;
    const { status } = req.body; // "verified" or "rejected"

    if (!status || !["verified", "rejected"].includes(status)) {
      return errorResponse(res, 400, "Valid status is required (verified/rejected)");
    }

    const payment = await Payment.findOne({ id: paymentId });
    if (!payment) {
      return errorResponse(res, 404, "Payment not found");
    }

    // Update payment status
    await payment.update({
      status,
      verifiedBy: req.user.id,
      verifiedAt: Date.now(),
    });

    // Update order payment status
    const paymentData = payment.getData();
    const order = await Order.findOne({ id: paymentData.orderId });
    if (order) {
      await order.update({
        paymentStatus: status === "verified" ? "completed" : "failed"
      });
    }

    const updated = await Payment.findOne({ id: paymentId });
    return successResponse(res, 200, `Payment ${status} successfully`, formatDoc(updated));
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// GET STORE PAYMENTS
const getStorePayments = async (req, res) => {
  try {
    if (req.role !== "store") {
      return errorResponse(res, 403, "Only store can view their payments");
    }

    const storeId = req.user.id;

    // Get all orders for this store
    const orders = await Order.findAll({ where: { storeId } });
    const orderIds = orders.map(order => order.getId());

    // Get payments for these orders
    const allPayments = await Payment.findAll();
    const storePayments = allPayments.filter(payment => 
      orderIds.includes(payment.getData().orderId)
    );

    const paymentsData = formatDocs(storePayments).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    return successResponse(res, 200, "Store payments fetched successfully", paymentsData);
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// UPDATE PAYMENT STATUS (ADMIN)
const updatePaymentStatus = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return errorResponse(res, 403, "Only admin can update payment status");
    }

    const { paymentId } = req.params;
    const { status } = req.body;

    if (!status) {
      return errorResponse(res, 400, "Status is required");
    }

    const payment = await Payment.findOne({ id: paymentId });
    if (!payment) {
      return errorResponse(res, 404, "Payment not found");
    }

    await payment.update({ status });

    const updated = await Payment.findOne({ id: paymentId });
    return successResponse(res, 200, "Payment status updated successfully", formatDoc(updated));
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

module.exports = {
  initiatePayment,
  getPaymentByOrderId,
  getPaymentById,
  getAllPayments,
  uploadPaymentReceipt,
  verifyPayment,
  getStorePayments,
  updatePaymentStatus,
};
