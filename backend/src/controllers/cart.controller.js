const { Cart, Product } = require("../../models/firestore");
const { formatDoc, formatDocs } = require("../../util/firestore-helpers");

const addToCart = async (req, res) => {
  try {
    if (req.user.role !== "store")
      return res.status(403).json({ status: false, message: "Only store can access cart" });

    const storeId = req.user.id;
    const { productId, qty = 1 } = req.body;

    if (!productId) return res.status(400).json({ status: false, message: "productId required" });

    const product = await Product.findOne({ id: productId });
    if (!product) return res.status(404).json({ status: false, message: "Product not found" });

    if (product.getData().storeId !== storeId)
      return res.status(403).json({ status: false, message: "Product belongs to another store" });

    let cart = await Cart.findOne({ where: { storeId } });
    if (!cart) {
      cart = await Cart.create({ storeId, items: [] });
    }

    const cartData = cart.getData();
    const existing = cartData.items.find(i => i.productId === productId);
    
    if (existing) {
      existing.qty += qty;
    } else {
      cartData.items.push({ productId, qty, price: product.getData().price });
    }

    await cart.update({ items: cartData.items });

    const updatedCart = await Cart.findOne({ where: { storeId } });
    return res.status(200).json({ status: true, message: "Item added", cart: formatDoc(updatedCart) });
  } catch (err) {
    console.error("ADD_CART_ERROR:", err);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};


const getCart = async (req, res) => {
  try {
    if (req.user.role !== "store")
      return res.status(403).json({ status: false, message: "Only store can access cart" });

    const storeId = req.user.id;
    const cart = await Cart.findOne({ where: { storeId } });

    if (!cart) {
      return res.status(200).json({ status: true, message: "Cart fetched", cart: { items: [] } });
    }

    const cartData = formatDoc(cart);
    
    // Populate products
    const populatedItems = await Promise.all(
      cartData.items.map(async (item) => {
        const product = await Product.findOne({ id: item.productId });
        return {
          ...item,
          productId: product ? formatDoc(product) : item.productId
        };
      })
    );

    cartData.items = populatedItems;

    return res.status(200).json({ status: true, message: "Cart fetched", cart: cartData });
  } catch (err) {
    console.error("GET_CART_ERROR:", err);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};


const updateCartItem = async (req, res) => {
  try {
    if (req.user.role !== "store")
      return res.status(403).json({ status: false, message: "Only store can access cart" });

    const storeId = req.user.id;
    const { productId, qty } = req.body;

    if (!productId || qty == null)
      return res.status(400).json({ status: false, message: "productId & qty required" });

    const cart = await Cart.findOne({ where: { storeId } });
    if (!cart) return res.status(404).json({ status: false, message: "Cart not found" });

    const cartData = cart.getData();
    const item = cartData.items.find(i => i.productId === productId);
    if (!item) return res.status(404).json({ status: false, message: "Item not found" });

    if (qty <= 0) {
      cartData.items = cartData.items.filter(i => i.productId !== productId);
    } else {
      item.qty = qty;
    }

    await cart.update({ items: cartData.items });

    const updatedCart = await Cart.findOne({ where: { storeId } });
    return res.status(200).json({ status: true, message: "Cart updated", cart: formatDoc(updatedCart) });
  } catch (err) {
    console.error("UPDATE_CART_ERROR:", err);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};


const removeFromCart = async (req, res) => {
  try {
    if (req.user.role !== "store")
      return res.status(403).json({ status: false, message: "Only store can access cart" });

    const storeId = req.user.id;
    const { productId } = req.body;

    if (!productId) return res.status(400).json({ status: false, message: "productId required" });

    const cart = await Cart.findOne({ where: { storeId } });
    if (!cart) return res.status(404).json({ status: false, message: "Cart not found" });

    const cartData = cart.getData();
    cartData.items = cartData.items.filter(i => i.productId !== productId);

    await cart.update({ items: cartData.items });

    const updatedCart = await Cart.findOne({ where: { storeId } });
    return res.status(200).json({ status: true, message: "Item removed", cart: formatDoc(updatedCart) });
  } catch (err) {
    console.error("REMOVE_CART_ERROR:", err);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};


const clearCart = async (req, res) => {
  try {
    if (req.user.role !== "store")
      return res.status(403).json({ status: false, message: "Only store can access cart" });

    const storeId = req.user.id;
    const cart = await Cart.findOne({ where: { storeId } });

    if (!cart) return res.status(404).json({ status: false, message: "Cart not found" });

    await cart.update({ items: [] });

    return res.status(200).json({ status: true, message: "Cart cleared", cart: { items: [] } });
  } catch (err) {
    console.error("CLEAR_CART_ERROR:", err);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

module.exports = { addToCart, getCart, updateCartItem, removeFromCart, clearCart };
