const { Order, Cart, Product, Payment, Address, Store } = require("../../models/firestore");
const { formatDoc, formatDocs } = require("../../util/firestore-helpers");
const { successResponse, errorResponse } = require("../utils/responseHandler.js");


// ================= CREATE ORDER FROM CART =================
const createOrderFromCart = async (req, res) => {
  try {
    if (req.role !== "store") 
      return errorResponse(res, 403, "Only store user can create order");

    const storeId = req.user.id;
    const { addressId } = req.body;

    if (!addressId) {
      return errorResponse(res, 400, "Shipping address is required");
    }

    // Verify address belongs to store
    const address = await Address.findOne({ id: addressId });
    if (!address || address.getData().storeId !== storeId) {
      return errorResponse(res, 404, "Address not found");
    }

    const cart = await Cart.findOne({ where: { storeId } });
    if (!cart || cart.getData().items.length === 0)
      return errorResponse(res, 400, "Cart is empty");

    let totalAmount = 0;
    const products = [];
    const cartData = cart.getData();

    for (const item of cartData.items) {
      const prod = await Product.findOne({ id: item.productId });

      if (!prod)
        return errorResponse(res, 404, `Product not found: ${item.productId}`);

      const prodData = prod.getData();
      if (prodData.storeId !== storeId)
        return errorResponse(res, 403, "Product belongs to another store");

      if (prodData.qty < item.qty)
        return errorResponse(res, 400, `Insufficient stock: ${prodData.name}`);

      products.push({ productId: prod.getId(), qty: item.qty, price: prodData.price });
      totalAmount += prodData.price * item.qty;
    }

    const addressData = address.getData();
    
    // Create order with shipping address
    const order = await Order.create({
      storeId,
      products,
      totalAmount,
      shippingAddress: {
        fullName: addressData.fullName,
        phone: addressData.phone,
        addressLine1: addressData.addressLine1,
        addressLine2: addressData.addressLine2,
        city: addressData.city,
        state: addressData.state,
        zipCode: addressData.zipCode,
        country: addressData.country,
      },
      status: "pending",
      paymentStatus: "pending",
      shippingStatus: "pending",
    });

    // Update product quantities
    for (const p of products) {
      const product = await Product.findOne({ id: p.productId });
      const currentQty = product.getData().qty;
      await product.update({ qty: currentQty - p.qty });
    }

    // Clear cart
    await Cart.destroy({ where: { storeId } });

    return successResponse(res, 201, "Order created successfully", formatDoc(order));

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

    const orders = await Order.findAll({ where: { storeId } });
    
    // Sort by creation date
    const sortedOrders = formatDocs(orders).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Populate products
    const populatedOrders = await Promise.all(
      sortedOrders.map(async (order) => {
        const populatedProducts = await Promise.all(
          order.products.map(async (item) => {
            const product = await Product.findOne({ id: item.productId });
            return {
              ...item,
              productId: product ? formatDoc(product) : item.productId
            };
          })
        );
        return { ...order, products: populatedProducts };
      })
    );

    return successResponse(res, 200, "Store orders fetched", populatedOrders);
  } catch (error) {
    console.error("[GET STORE ORDERS ERROR]:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};


// ================= GET ALL ORDERS (ADMIN) =================
const getAllOrders = async (req, res) => {
  try {
    if (req.role !== "admin") 
      return errorResponse(res, 403, "Only admin can view all orders");

    // Fetch all orders
    const orders = await Order.findAll();
    const formattedOrders = formatDocs(orders);

    // Fetch all stores
    const stores = await Store.findAll();
    const formattedStores = formatDocs(stores);

    // Create store lookup map
    const storeMap = {};
    formattedStores.forEach(store => {
      storeMap[store.id] = store;
    });

    // Attach store details to each order
    const ordersWithStore = formattedOrders.map(order => ({
      ...order,
      store: storeMap[order.storeId] || null
    }));

    // Sort by createdAt
    const sortedOrders = ordersWithStore.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return successResponse(res, 200, "All orders fetched", sortedOrders);

  } catch (error) {
    console.error("[GET ALL ORDERS ERROR]:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};




// ================= GET ORDER BY ID =======================
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({ id });
    if (!order) return errorResponse(res, 404, "Order not found");

    const orderData = formatDoc(order);

    // Check authorization
    if (req.role === "store" && orderData.storeId !== req.user.id) {
      return errorResponse(res, 403, "Not authorized to view this order");
    }

    // Populate products
    const populatedProducts = await Promise.all(
      orderData.products.map(async (item) => {
        const product = await Product.findOne({ id: item.productId });
        return {
          ...item,
          productId: product ? formatDoc(product) : item.productId
        };
      })
    );

    // Populate store information (for admin)
    let storeData = orderData.storeId;
    if (req.role === "admin") {
      const store = await Store.findOne({ id: orderData.storeId });
      storeData = store ? formatDoc(store) : orderData.storeId;
    }

    // Populate payment if exists
    let paymentData = orderData.paymentId;
    if (orderData.paymentId) {
      const payment = await Payment.findOne({ id: orderData.paymentId });
      paymentData = payment ? formatDoc(payment) : orderData.paymentId;
    }

    const populatedOrder = {
      ...orderData,
      products: populatedProducts,
      storeId: storeData,
      paymentId: paymentData
    };

    return successResponse(res, 200, "Order fetched successfully", populatedOrder);
  } catch (error) {
    console.error("[GET ORDER ERROR]:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};


// ================= UPDATE ORDER STATUS (ADMIN) ===========
const updateOrderStatus = async (req, res) => {
  try {
    if (req.role !== "admin") 
      return errorResponse(res, 403, "Only admin can update order status");

    const { id } = req.params;
    const { status } = req.body;

    if (!status) return errorResponse(res, 400, "Status is required");

    const order = await Order.findOne({ id });
    if (!order) return errorResponse(res, 404, "Order not found");

    await order.update({ status });

    const updated = await Order.findOne({ id });
    return successResponse(res, 200, "Order status updated", formatDoc(updated));
  } catch (error) {
    console.error("[UPDATE ORDER STATUS ERROR]:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};


// ================= CONFIRM ORDER (ADMIN) =================
const confirmOrder = async (req, res) => {
  try {
    if (req.role !== "admin") 
      return errorResponse(res, 403, "Only admin can confirm orders");

    const { id } = req.params;

    const order = await Order.findOne({ id });
    if (!order) return errorResponse(res, 404, "Order not found");

    const orderData = order.getData();

    // Check if order is already confirmed
    if (orderData.status === "confirmed") {
      return errorResponse(res, 400, "Order is already confirmed");
    }

    // Check if order is pending
    if (orderData.status !== "pending") {
      return errorResponse(res, 400, "Only pending orders can be confirmed");
    }

    // Update order status to confirmed
    await order.update({ 
      status: "confirmed",
      confirmedBy: req.user.id,
      confirmedAt: Date.now()
    });

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ where: { orderId: id } });
    
    let paymentId;
    if (existingPayment) {
      paymentId = existingPayment.getId();
    } else {
      // Create payment automatically
      const payment = await Payment.create({
        orderId: id,
        storeId: orderData.storeId,
        amount: orderData.totalAmount,
        paymentMethod: "qr_code",
        status: "pending",
        qrCodeUrl: process.env.PAYMENT_QR_URL || "https://example.com/qr-code.png",
      });

      paymentId = payment.getId();

      // Update order with payment reference
      await order.update({ paymentId });
    }

    const updated = await Order.findOne({ id });
    return successResponse(res, 200, "Order confirmed and payment initiated", formatDoc(updated));
  } catch (error) {
    console.error("[CONFIRM ORDER ERROR]:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};


// ================= UPDATE PAYMENT STATUS (ADMIN) =========
const updatePaymentStatus = async (req, res) => {
  try {
    if (req.role !== "admin") 
      return errorResponse(res, 403, "Only admin can update payment status");

    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!paymentStatus) return errorResponse(res, 400, "Payment status is required");

    const order = await Order.findOne({ id });
    if (!order) return errorResponse(res, 404, "Order not found");

    await order.update({ paymentStatus });

    const updated = await Order.findOne({ id });
    return successResponse(res, 200, "Payment status updated", formatDoc(updated));
  } catch (error) {
    console.error("[UPDATE PAYMENT STATUS ERROR]:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};


// ================= UPDATE SHIPPING STATUS (ADMIN) ========
const updateShippingStatus = async (req, res) => {
  try {
    if (req.role !== "admin") 
      return errorResponse(res, 403, "Only admin can update shipping status");

    const { id } = req.params;
    const { shippingStatus } = req.body;

    if (!shippingStatus) return errorResponse(res, 400, "Shipping status is required");

    const order = await Order.findOne({ id });
    if (!order) return errorResponse(res, 404, "Order not found");

    await order.update({ shippingStatus });

    const updated = await Order.findOne({ id });
    return successResponse(res, 200, "Shipping status updated", formatDoc(updated));
  } catch (error) {
    console.error("[UPDATE SHIPPING STATUS ERROR]:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};


// ================= CONFIRM ORDER RECEIVED (STORE) ========
const confirmOrderReceived = async (req, res) => {
  try {
    if (req.role !== "store") 
      return errorResponse(res, 403, "Only store can confirm order received");

    const { id } = req.params;

    const order = await Order.findOne({ id });
    if (!order) return errorResponse(res, 404, "Order not found");

    const orderData = order.getData();

    // Check if order belongs to store
    if (orderData.storeId !== req.user.id) {
      return errorResponse(res, 403, "Not authorized to update this order");
    }

    // Check if order is shipped
    if (orderData.shippingStatus !== "shipped") {
      return errorResponse(res, 400, "Only shipped orders can be confirmed as received");
    }

    // Check if already confirmed
    if (orderData.orderReceivedConfirmation) {
      return errorResponse(res, 400, "Order already confirmed as received");
    }

    // Update order
    await order.update({
      orderReceivedConfirmation: true,
      orderReceivedAt: Date.now(),
      shippingStatus: "delivered",
      deliveredAt: Date.now(),
      status: "completed"
    });

    const updated = await Order.findOne({ id });
    return successResponse(res, 200, "Order confirmed as received", formatDoc(updated));
  } catch (error) {
    console.error("[CONFIRM ORDER RECEIVED ERROR]:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};


// ================= DELETE ORDER (ADMIN) ==================
const deleteOrder = async (req, res) => {
  try {
    if (req.role !== "admin") 
      return errorResponse(res, 403, "Only admin can delete orders");

    const { id } = req.params;

    const order = await Order.findOne({ id });
    if (!order) return errorResponse(res, 404, "Order not found");

    await Order.destroy({ id });

    return successResponse(res, 200, "Order deleted successfully");
  } catch (error) {
    console.error("[DELETE ORDER ERROR]:", error);
    return errorResponse(res, 500, "Internal server error");
  }
};


module.exports = {
  createOrderFromCart,
  getStoreOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  confirmOrder,
  updatePaymentStatus,
  updateShippingStatus,
  confirmOrderReceived,
  deleteOrder,
};
