const Cart = require("../../models/cart.model.js");
const Product = require("../../models/product.model.js");
const { asyncHandler } = require("../utils/asyncHandler.js");
const { successResponse, errorResponse } = require("../utils/responseHandler.js");

//helper
const getOrCreateCart = async (userId, storeId) => {
  let cart = await Cart.findOne({ userId, storeId });
  if (!cart) cart = await Cart.create({ userId, storeId, items: [] });
  return cart;
};

const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const storeId = req.user.storeId;
  const { productId, qty = 1 } = req.body;

  if (!productId) return errorResponse(res, "productId is required", 400);

  const product = await Product.findById(productId);
  if (!product) return errorResponse(res, "Product not found", 404);
  if (!product.storeId.equals(storeId))
    return errorResponse(res, "Product belongs to another store", 403);

  const cart = await getOrCreateCart(userId, storeId);

  const existing = cart.items.find(i => i.productId.equals(productId));
  existing ? (existing.qty += qty) : cart.items.push({ productId, qty, price: product.price });

  cart.updatedAt = Date.now();
  await cart.save();

  return successResponse(res, cart, "Item added to cart successfully");
});

const getCart = asyncHandler(async (req, res) => {
  const { _id: userId, storeId } = req.user;

  const cart = await Cart.findOne({ userId, storeId }).populate("items.productId");
  return successResponse(res, cart || { items: [] }, "Cart fetched successfully");
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { _id: userId, storeId } = req.user;
  const { productId, qty } = req.body;

  if (!productId || qty == null)
    return errorResponse(res, "productId & qty are required", 400);

  const cart = await Cart.findOne({ userId, storeId });
  if (!cart) return errorResponse(res, "Cart not found", 404);

  const item = cart.items.find(i => i.productId.equals(productId));
  if (!item) return errorResponse(res, "Item not found", 404);

  qty <= 0
    ? (cart.items = cart.items.filter(i => !i.productId.equals(productId)))
    : (item.qty = qty);

  cart.updatedAt = Date.now();
  await cart.save();

  return successResponse(res, cart, "Cart updated successfully");
});

const removeCartItem = asyncHandler(async (req, res) => {
  const { _id: userId, storeId } = req.user;
  const { productId } = req.params;

  const cart = await Cart.findOne({ userId, storeId });
  if (!cart) return errorResponse(res, "Cart not found", 404);

  cart.items = cart.items.filter(i => !i.productId.equals(productId));
  cart.updatedAt = Date.now();
  await cart.save();

  return successResponse(res, cart, "Item removed successfully");
});

const clearCart = asyncHandler(async (req, res) => {
  const { _id: userId, storeId } = req.user;

  await Cart.findOneAndDelete({ userId, storeId });
  return successResponse(res, {}, "Cart cleared successfully");
});

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
