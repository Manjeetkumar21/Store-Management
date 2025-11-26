const Cart = require("../../models/cart.model.js");
const Product = require("../../models/product.model.js");
const { asyncHandler } = require("../utils/asyncHandler.js");
const { ApiError } = require("../utils/apiError.js");
const { ApiResponse } = require("../utils/apiResponse.js");

// Helper: get or create cart for user-store
const getOrCreateCart = async (userId, storeId) => {
  let cart = await Cart.findOne({ userId, storeId });
  if (!cart) {
    cart = await Cart.create({ userId, storeId, items: [] });
  }
  return cart;
};

// Add item to cart
const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const storeId = req.user.storeId; // store user must have this
  const { productId, qty = 1 } = req.body;

  if (!productId) throw new ApiError(400, "productId required");

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");
  if (!product.storeId.equals(storeId))
    throw new ApiError(403, "Cannot add product from other store");

  const cart = await getOrCreateCart(userId, storeId);

  const existing = cart.items.find((i) => i.productId.equals(productId));
  if (existing) {
    existing.qty += qty;
  } else {
    cart.items.push({ productId, qty, price: product.price });
  }

  cart.updatedAt = Date.now();
  await cart.save();

  return res.status(200).json(new ApiResponse(200, cart, "Item added to cart"));
});

// Get cart
const getCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const storeId = req.user.storeId;
  const cart = await Cart.findOne({ userId, storeId }).populate(
    "items.productId"
  );
  return res.status(200).json(new ApiResponse(200, cart || { items: [] }));
});

// Update cart item qty
const updateCartItem = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const storeId = req.user.storeId;
  const { productId, qty } = req.body;

  if (!productId || !qty) throw new ApiError(400, "productId and qty required");

  const cart = await Cart.findOne({ userId, storeId });
  if (!cart) throw new ApiError(404, "Cart not found");

  const item = cart.items.find((i) => i.productId.equals(productId));
  if (!item) throw new ApiError(404, "Item not found in cart");

  if (qty <= 0) {
    cart.items = cart.items.filter((i) => !i.productId.equals(productId));
  } else {
    item.qty = qty;
  }

  cart.updatedAt = Date.now();
  await cart.save();

  return res.status(200).json(new ApiResponse(200, cart, "Cart updated"));
});

// Remove cart item
const removeCartItem = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const storeId = req.user.storeId;
  const { productId } = req.params;

  const cart = await Cart.findOne({ userId, storeId });
  if (!cart) throw new ApiError(404, "Cart not found");

  cart.items = cart.items.filter((i) => !i.productId.equals(productId));
  cart.updatedAt = Date.now();
  await cart.save();

  return res.status(200).json(new ApiResponse(200, cart, "Item removed"));
});

// Clear cart
const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const storeId = req.user.storeId;
  await Cart.findOneAndDelete({ userId, storeId });
  return res.status(200).json(new ApiResponse(200, {}, "Cart cleared"));
});

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
