const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db.js");
const authRoutes = require("./src/routes/auth.routes.js");
const companyRoutes = require("./src/routes/company.routes.js");
const storeRoutes = require("./src/routes/store.routes.js");
const productRoutes = require("./src/routes/product.routes.js");
const cartRoutes = require("./src/routes/cart.routes.js");
const orderRoutes = require("./src/routes/order.routes.js");
const statsRoutes = require("./src/routes/stats.routes.js");
const uploadRoutes = require("./src/routes/upload.routes.js");

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: "*", credentials: true }));

connectDB();

app.get("/", (req, res) => {
  res.json({ message: "Store Management Backend Running" });
});

app.get("/health", (req, res) => {
  res.json({ message: "Health Check" });
});


app.use("/api/auth", authRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Store Management Backend Running" });
});

app.get("/health", (req, res) => {
  res.json({ message: "Health Check" });
});

  // app.use((req, res) => {
  //   res.status(404).json({ message: "Nahi milaaaa" });
  // });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
