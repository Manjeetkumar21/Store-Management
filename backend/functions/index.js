require("dotenv").config();
const { onRequest } = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db.js");

/* ✅ ROUTES */
const authRoutes = require("./src/routes/auth.routes.js");
const companyRoutes = require("./src/routes/company.routes.js");
const storeRoutes = require("./src/routes/store.routes.js");
const productRoutes = require("./src/routes/product.routes.js");
const cartRoutes = require("./src/routes/cart.routes.js");
const orderRoutes = require("./src/routes/order.routes.js");
const addressRoutes = require("./src/routes/address.routes.js");
const paymentRoutes = require("./src/routes/payment.routes.js");
const statsRoutes = require("./src/routes/stats.routes.js");
const uploadRoutes = require("./src/routes/upload.routes.js");

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

connectDB();

app.get("/", (req, res) => {
  res.json({ message: "✅ Store Management Backend Running on Firebase Gen 2" });
});

app.get("/health", (req, res) => {
  res.json({ message: "✅ Health Check OK" });
});

app.use("/auth", authRoutes);
app.use("/company", companyRoutes);
app.use("/store", storeRoutes);
app.use("/product", productRoutes);
app.use("/cart", cartRoutes);
app.use("/order", orderRoutes);
app.use("/address", addressRoutes);
app.use("/payment", paymentRoutes);
app.use("/stats", statsRoutes);
app.use("/upload", uploadRoutes);

app.use((err, req, res, next) => {
  console.error("❌ Error:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "❌ Route not found",
  });
});

exports.api = onRequest(app);
