const Order = require("../../models/order.model.js");
const Cart = require("../../models/cart.model.js");
const Product = require("../../models/product.model.js");
const { successResponse, errorResponse } = require("../utils/responseHandler.js");


// ================= CREATE ORDER FROM CART =================
const createOrderFromCart = async (req, res) => {
  try {
    if (req.role !== "store") 
      return errorResponse(res, 403, "Only store user can create order");

    const userId = req.user._id;
    const storeId = req.user.storeId;

    const cart = await Cart.findOne({ userId, storeId });
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

    const order = await Order.create({
      userId,
      storeId,
      products,
      totalAmount,
      status: "pending"
    });

    for (const p of products) {
      await Product.findByIdAndUpdate(p.productId, { $inc: { qty: -p.qty } });
    }

    await Cart.findOneAndDelete({ userId, storeId });

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

    const storeId = req.user.storeId;

    const orders = await Order.find({ storeId })
      .sort({ createdAt: -1 })
      .populate("products.productId");

    return successResponse(res, 200, "Orders fetched successfully", orders);

  } catch (error) {
    console.error("[FETCH STORE ORDERS ERROR]:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};



// ================= ADMIN: GET ALL ORDERS ===================
const getAllOrders = async (req, res) => {
  try {
    if (req.role !== "admin") 
      return errorResponse(res, 403, "Only admin can view all orders");

    const { status, storeId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (storeId) filter.storeId = storeId;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate("products.productId storeId");

    return successResponse(res, 200, "All orders fetched successfully", orders);

  } catch (error) {
    console.error("[ADMIN GET ORDERS ERROR]:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};



// ================= UPDATE ORDER STATUS =====================
const updateOrderStatus = async (req, res) => {
  try {
    if (req.role !== "store" && req.role !== "admin")
      return errorResponse(res, 403, "Not authorized to update status");

    const { id } = req.params;
    const { status } = req.body;

    const validStatus = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!validStatus.includes(status))
      return errorResponse(res, 400, "Invalid order status");

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return errorResponse(res, 404, "Order not found");

    return successResponse(res, 200, "Order status updated successfully", order);

  } catch (error) {
    console.error("[UPDATE ORDER STATUS ERROR]:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};


module.exports = {
  createOrderFromCart,
  getStoreOrders,
  getAllOrders,
  updateOrderStatus,
};
