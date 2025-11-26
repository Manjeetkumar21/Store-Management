const Company = require("../../models/company.model.js");
const Store = require("../../models/store.model.js");
const Product = require("../../models/product.model.js");
const Order = require("../../models/order.model.js");

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

    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10);

    res.json({
      success: true,
      stats: {
        totalCompanies,
        totalStores,
        totalProducts,
        totalOrders,
        revenue,
        recentOrders,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===================== STORE DASHBOARD =====================
const getStoreStats = async (req, res) => {
  try {
    const storeId = req.params.storeId;

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
      .limit(10);

    res.json({
      success: true,
      stats: {
        storeProducts,
        storeOrders,
        totalSales,
        recentOrders,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAdminStats, getStoreStats };
