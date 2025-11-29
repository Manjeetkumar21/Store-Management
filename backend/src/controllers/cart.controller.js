const Cart = require("../../models/cart.model.js");
const Product = require("../../models/product.model.js");

const addToCart = async (req, res) => {
  try {
    if (req.user.role !== "store")
      return res.status(403).json({ status: false, message: "Only store can access cart" });

    const storeId = req.user._id;
    const { productId, qty = 1 } = req.body;

    if (!productId) return res.status(400).json({ status: false, message: "productId required" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ status: false, message: "Product not found" });

    if (!product.storeId.equals(storeId))
      return res.status(403).json({ status: false, message: "Product belongs to another store" });

    let cart = await Cart.findOne({ storeId });
    if (!cart) cart = await Cart.create({ storeId, items: [] });

    const existing = cart.items.find(i => i.productId.equals(productId));
    existing ? existing.qty += qty : cart.items.push({ productId, qty, price: product.price });

    cart.updatedAt = Date.now();
    await cart.save();

    return res.status(200).json({ status: true, message: "Item added", cart });
  } catch (err) {
    console.error("ADD_CART_ERROR:", err);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};


const getCart = async (req, res) => {
  try {
    if (req.user.role !== "store")
      return res.status(403).json({ status: false, message: "Only store can access cart" });

    const storeId = req.user._id;
    const cart = await Cart.findOne({ storeId }).populate("items.productId");

    return res.status(200).json({ status: true, message: "Cart fetched", cart: cart || { items: [] } });
  } catch (err) {
    console.error("GET_CART_ERROR:", err);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};


const updateCartItem = async (req, res) => {
  try {
    if (req.user.role !== "store")
      return res.status(403).json({ status: false, message: "Only store can access cart" });

    const storeId = req.user._id;
    const { productId, qty } = req.body;

    if (!productId || qty == null)
      return res.status(400).json({ status: false, message: "productId & qty required" });

    const cart = await Cart.findOne({ storeId });
    if (!cart) return res.status(404).json({ status: false, message: "Cart not found" });

    const item = cart.items.find(i => i.productId.equals(productId));
    if (!item) return res.status(404).json({ status: false, message: "Item not found" });

    if (qty <= 0)
      cart.items = cart.items.filter(i => !i.productId.equals(productId));
    else
      item.qty = qty;

    cart.updatedAt = Date.now();
    await cart.save();

    return res.status(200).json({ status: true, message: "Cart updated", cart });
  } catch (err) {
    console.error("UPDATE_CART_ERROR:", err);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};


const removeCartItem = async (req, res) => {
  try {
    if (req.user.role !== "store")
      return res.status(403).json({ status: false, message: "Only store can access cart" });

    const storeId = req.user._id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ storeId });
    if (!cart) return res.status(404).json({ status: false, message: "Cart not found" });

    cart.items = cart.items.filter(i => !i.productId.equals(productId));
    cart.updatedAt = Date.now();
    await cart.save();

    return res.status(200).json({ status: true, message: "Item removed", cart });
  } catch (err) {
    console.error("REMOVE_ITEM_ERROR:", err);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};


const clearCart = async (req, res) => {
  try {
    if (req.user.role !== "store")
      return res.status(403).json({ status: false, message: "Only store can access cart" });

    const storeId = req.user._id;
    await Cart.findOneAndDelete({ storeId });

    return res.status(200).json({ status: true, message: "Cart cleared" });
  } catch (err) {
    console.error("CLEAR_CART_ERROR:", err);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};


module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
