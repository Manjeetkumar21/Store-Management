const Order = require("../../models/order.model.js");
const Cart = require("../../models/cart.model.js");
const Product = require("../../models/product.model.js");
const Payment = require("../../models/payment.model.js");
const Address = require("../../models/address.model.js");
const { successResponse, errorResponse } = require("../utils/responseHandler.js");


// ================= CREATE ORDER FROM CART =================
const createOrderFromCart = async (req, res) => {
  try {
    if (req.role !== "store") 
      return errorResponse(res, 403, "Only store user can create order");

    console.log(req.user);
    const userId = req.user._id;
    const storeId = req.user.id;
    const { addressId } = req.body;

    if (!addressId) {
      return errorResponse(res, 400, "Shipping address is required");
    }

    // Verify address belongs to store
    const address = await Address.findOne({ _id: addressId, storeId });
    if (!address) {
      return errorResponse(res, 404, "Address not found");
    }

    const cart = await Cart.findOne({ storeId });
    if (!cart || cart.items.length === 0)
      return errorResponse(res, 400, "Cart is empty");

    let totalAmount = 0;
    const products = [];

    for (const item of cart.items) {
      const prod = await Product.findById(item.productId);

      if (!prod)
        return errorResponse(res, 404, `Product not found: ${item.productId}`);

      if (!prod.storeId.equals(storeId))
        return errorResponse(res, 403, "Product belongs to another store");

      if (prod.qty < item.qty)
        return errorResponse(res, 400, `Insufficient stock: ${prod.name}`);

      products.push({ productId: prod._id, qty: item.qty, price: prod.price });
      totalAmount += prod.price * item.qty;
    }

    // Create order with shipping address
    const order = await Order.create({
      storeId,
      products,
      totalAmount,
      shippingAddress: {
        fullName: address.fullName,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
      },
      status: "pending",
      paymentStatus: "pending",
      shippingStatus: "pending",
    });

    // Update product quantities
    for (const p of products) {
      await Product.findByIdAndUpdate(p.productId, { $inc: { qty: -p.qty } });
    }

    // Clear cart
    await Cart.findOneAndDelete({ storeId });

    return successResponse(res, 201, "Order created successfully", order);

  } catch (error) {
    console.error("[CREATE ORDER ERROR]:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};


// ================= STORE ORDERS ===========================
const getStoreOrders = async (req, res) => {
  try {
    if (req.role !== "store") 
      return errorResponse(res, 403, "Only store users can view store orders");

    const storeId = req.user.id;

    const orders = await Order.find({ storeId })
      .sort({ createdAt: -1 })
      .populate("products.productId")
      .populate("paymentId");

    return successResponse(res, 200, "Orders fetched successfully", orders);

  } catch (error) {
    console.error("[FETCH STORE ORDERS ERROR]:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};


// ================= GET ORDER BY ID ========================
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate("products.productId")
      .populate("storeId")
      .populate("paymentId")
      .populate("confirmedBy cancelledBy", "name email");

    if (!order) {
      return errorResponse(res, 404, "Order not found");
    }

    // Check authorization
    if (req.role === "store" && !order.storeId._id.equals(req.user.id)) {
      return errorResponse(res, 403, "Not authorized to view this order");
    }

    return successResponse(res, 200, "Order fetched successfully", order);

  } catch (error) {
    console.error("[GET ORDER ERROR]:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};


// ================= ADMIN: GET ALL ORDERS ===================
const getAllOrders = async (req, res) => {
  try {
    if (req.role !== "admin") 
      return errorResponse(res, 403, "Only admin can view all orders");

    const { status, paymentStatus, shippingStatus, storeId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (shippingStatus) filter.shippingStatus = shippingStatus;
    if (storeId) filter.storeId = storeId;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate("products.productId")
      .populate("storeId", "name email location")
      .populate("paymentId")
      .populate("confirmedBy cancelledBy", "name email");

    return successResponse(res, 200, "All orders fetched successfully", orders);

  } catch (error) {
    console.error("[ADMIN GET ORDERS ERROR]:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};


// ================= ADMIN: CONFIRM ORDER ====================
const confirmOrder = async (req, res) => {
  try {
    if (req.role !== "admin") 
      return errorResponse(res, 403, "Only admin can confirm orders");

    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return errorResponse(res, 404, "Order not found");
    }

    if (order.status !== "pending") {
      return errorResponse(res, 400, "Only pending orders can be confirmed");
    }

    order.status = "confirmed";
    order.confirmedBy = req.user._id;
    order.confirmedAt = new Date();
    await order.save();

    // Create payment record
    const payment = await Payment.create({
      orderId: order._id,
      amount: order.totalAmount,
      paymentMethod: "qr_code",
      status: "pending",
      qrCodeUrl: process.env.PAYMENT_QR_URL || "https://example.com/qr-code.png",
    });

    order.paymentId = payment._id;
    await order.save();

    const updatedOrder = await Order.findById(id)
      .populate("products.productId")
      .populate("storeId")
      .populate("paymentId")
      .populate("confirmedBy", "name email");

    return successResponse(res, 200, "Order confirmed successfully", updatedOrder);

  } catch (error) {
    console.error("[CONFIRM ORDER ERROR]:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};


// ================= ADMIN: CANCEL ORDER =====================
const cancelOrder = async (req, res) => {
  try {
    if (req.role !== "admin") 
      return errorResponse(res, 403, "Only admin can cancel orders");

    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return errorResponse(res, 404, "Order not found");
    }

    if (order.status === "cancelled") {
      return errorResponse(res, 400, "Order already cancelled");
    }

    if (order.status === "completed") {
      return errorResponse(res, 400, "Cannot cancel completed order");
    }

    // Restore product quantities
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { qty: item.qty } });
    }

    order.status = "cancelled";
    order.cancelledBy = req.user._id;
    order.cancelledAt = new Date();
    order.cancellationReason = reason || "Cancelled by admin";
    await order.save();

    const updatedOrder = await Order.findById(id)
      .populate("products.productId")
      .populate("storeId")
      .populate("cancelledBy", "name email");

    return successResponse(res, 200, "Order cancelled successfully", updatedOrder);

  } catch (error) {
    console.error("[CANCEL ORDER ERROR]:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};


// ================= ADMIN: MARK AS SHIPPED ==================
const markAsShipped = async (req, res) => {
  try {
    if (req.role !== "admin") 
      return errorResponse(res, 403, "Only admin can mark orders as shipped");

    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return errorResponse(res, 404, "Order not found");
    }

    if (order.paymentStatus !== "verified") {
      return errorResponse(res, 400, "Payment must be verified before shipping");
    }

    if (order.shippingStatus === "shipped" || order.shippingStatus === "delivered") {
      return errorResponse(res, 400, "Order already shipped");
    }

    order.shippingStatus = "shipped";
    order.shippedAt = new Date();
    await order.save();

    const updatedOrder = await Order.findById(id)
      .populate("products.productId")
      .populate("storeId")
      .populate("paymentId");

    return successResponse(res, 200, "Order marked as shipped", updatedOrder);

  } catch (error) {
    console.error("[MARK SHIPPED ERROR]:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};


// ================= STORE: CONFIRM ORDER RECEIVED ===========
const confirmOrderReceived = async (req, res) => {
  try {
    if (req.role !== "store") 
      return errorResponse(res, 403, "Only store users can confirm order received");

    const { id } = req.params;
    const storeId = req.user.id;

    const order = await Order.findById(id);
    if (!order) {
      return errorResponse(res, 404, "Order not found");
    }

    if (!order.storeId.equals(storeId)) {
      return errorResponse(res, 403, "Not authorized to update this order");
    }

    if (order.shippingStatus !== "shipped") {
      return errorResponse(res, 400, "Order must be shipped before confirming receipt");
    }

    if (order.orderReceivedConfirmation) {
      return errorResponse(res, 400, "Order receipt already confirmed");
    }

    order.shippingStatus = "delivered";
    order.deliveredAt = new Date();
    order.orderReceivedConfirmation = true;
    order.orderReceivedAt = new Date();
    order.status = "completed";
    await order.save();

    const updatedOrder = await Order.findById(id)
      .populate("products.productId")
      .populate("storeId")
      .populate("paymentId");

    return successResponse(res, 200, "Order received confirmed", updatedOrder);

  } catch (error) {
    console.error("[CONFIRM RECEIVED ERROR]:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};


module.exports = {
  createOrderFromCart,
  getStoreOrders,
  getOrderById,
  getAllOrders,
  confirmOrder,
  cancelOrder,
  markAsShipped,
  confirmOrderReceived,
};
