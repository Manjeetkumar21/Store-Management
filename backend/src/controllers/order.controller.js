const Order = require("../../models/order.model.js");
const Cart = require("../../models/cart.model.js");
const Product = require("../../models/product.model.js");
const { asyncHandler } = require("../utils/asyncHandler.js");
const { ApiError } = require("../utils/apiError.js");
const { ApiResponse } = require("../utils/apiResponse.js");

// Create order from cart (store user)
const createOrderFromCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const storeId = req.user.storeId;

  const cart = await Cart.findOne({ userId, storeId });
  if (!cart || cart.items.length === 0)
    throw new ApiError(400, "Cart is empty");

  // Validate prices & availability
  let total = 0;
  const products = [];
  for (const item of cart.items) {
    const prod = await Product.findById(item.productId);
    if (!prod) throw new ApiError(404, `Product ${item.productId} not found`);
    if (!prod.storeId.equals(storeId))
      throw new ApiError(403, "Product belongs to different store");

    // optional: check stock qty
    if (prod.qty < item.qty)
      throw new ApiError(400, `Insufficient stock for ${prod.name}`);

    products.push({ productId: prod._id, qty: item.qty, price: prod.price });
    total += prod.price * item.qty;
  }

  const order = await Order.create({ storeId, products, totalAmount: total });

  // optionally decrement product qty in a transaction (left simple here)
  for (const item of products) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { qty: -item.qty },
    });
  }

  // clear cart
  await Cart.findOneAndDelete({ userId, storeId });

  return res.status(201).json(new ApiResponse(201, order, "Order created"));
});

// Get orders for logged-in store user (their store)
const getStoreOrders = asyncHandler(async (req, res) => {
  const storeId = req.user.storeId;
  const orders = await Order.find({ storeId })
    .sort({ createdAt: -1 })
    .populate("products.productId");
  return res.status(200).json(new ApiResponse(200, orders));
});

// Admin: get all orders (with optional filters)
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, storeId } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (storeId) filter.storeId = storeId;

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .populate("products.productId");
  return res.status(200).json(new ApiResponse(200, orders));
});

// Update order status (admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (
    !["pending", "confirmed", "shipped", "delivered", "cancelled"].includes(
      status
    )
  )
    throw new ApiError(400, "Invalid status");

  const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
  if (!order) throw new ApiError(404, "Order not found");

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order status updated"));
});

module.exports = {
  createOrderFromCart,
  getStoreOrders,
  getAllOrders,
  updateOrderStatus,
};
