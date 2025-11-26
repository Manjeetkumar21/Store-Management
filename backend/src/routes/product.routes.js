const { Router } = require("express");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller.js");

const { auth } = require("../middlewares/auth.middleware.js");
const { authorizeRoles } = require("../middlewares/role.middleware.js");

const router = Router();

// Public Routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Protected Admin Routes
router.post("/", auth, authorizeRoles("admin"), createProduct);
router.put("/:id", auth, authorizeRoles("admin"), updateProduct);
router.delete("/:id", auth, authorizeRoles("admin"), deleteProduct);

module.exports = router;
