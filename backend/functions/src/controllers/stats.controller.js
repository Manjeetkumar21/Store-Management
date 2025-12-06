const { Company, Store, Product, Order } = require("../../models/firestore");
const { formatDoc, formatDocs } = require("../../util/firestore-helpers");
const { successResponse, errorResponse } = require("../utils/responseHandler");

// ===================== ADMIN DASHBOARD =====================
const getAdminStats = async (req, res) => {
  try {
    const [companies, stores, products, orders] = await Promise.all([
      Company.findAll(),
      Store.findAll(),
      Product.findAll(),
      Order.findAll(),
    ]);

    const totalCompanies = companies.length;
    const totalStores = stores.length;
    const totalProducts = products.length;
    const totalOrders = orders.length;

    // Calculate total revenue
    const revenue = orders.reduce((sum, order) => {
      const orderData = order.getData();
      return sum + (orderData.totalAmount || 0);
    }, 0);

    // Get recent orders (last 10)
    const sortedOrders = formatDocs(orders).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    ).slice(0, 10);

    // Populate store names for recent orders
    const recentOrders = await Promise.all(
      sortedOrders.map(async (order) => {
        if (order.storeId) {
          const store = await Store.findOne({ id: order.storeId });
          if (store) {
            order.storeId = {
              id: store.getId(),
              name: store.getData().name
            };
          }
        }
        return order;
      })
    );

    return successResponse(res, 200, "Admin dashboard stats fetched", {
      totalCompanies,
      totalStores,
      totalProducts,
      totalOrders,
      revenue,
      recentOrders,
    });

  } catch (err) {
    return errorResponse(res, 500, "Could not fetch admin stats", err.message);
  }
};


// ===================== STORE DASHBOARD =====================
const getStoreStats = async (req, res) => {
  try {
    const { storeId } = req.params;

    if (!storeId) {
      return errorResponse(res, 400, "Store ID is required", {
        storeId: "Missing store ID"
      });
    }

    const [products, orders] = await Promise.all([
      Product.findAll({ where: { storeId } }),
      Order.findAll({ where: { storeId } }),
    ]);

    const storeProducts = products.length;
    const storeOrders = orders.length;

    // Calculate total sales
    const totalSales = orders.reduce((sum, order) => {
      const orderData = order.getData();
      return sum + (orderData.totalAmount || 0);
    }, 0);

    // Get recent orders (last 10)
    const recentOrders = formatDocs(orders)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    return successResponse(res, 200, "Store dashboard stats fetched", {
      storeProducts,
      storeOrders,
      totalSales,
      recentOrders,
    });

  } catch (err) {
    return errorResponse(res, 500, "Could not fetch store stats", err.message);
  }
};

module.exports = { getAdminStats, getStoreStats };
