const Company = require("../../models/company.model.js");
const Store = require("../../models/store.model.js");
const Product = require("../../models/product.model.js");
const Order = require("../../models/order.model.js");
const { successResponse, errorResponse } = require("../utils/responseHandler");

// ===================== ADMIN DASHBOARD =====================
const getAdminStats = async (req, res) => {
  try {
    const [totalCompanies, totalStores, totalProducts, totalOrders] =
      await Promise.all([
        Company.countDocuments(),
        Store.countDocuments(),
        Product.countDocuments(),
        Order.countDocuments(),
      ]);

    const revenueData = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);

    const revenue = revenueData[0]?.totalRevenue || 0;

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('storeId', 'name')
      .select("-__v");

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

    const [storeProducts, storeOrders] = await Promise.all([
      Product.countDocuments({ store: storeId }),
      Order.countDocuments({ store: storeId }),
    ]);

    const revenueData = await Order.aggregate([
      { $match: { store: storeId } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);

    const totalSales = revenueData[0]?.totalRevenue || 0;

    const recentOrders = await Order.find({ store: storeId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("-__v");

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
