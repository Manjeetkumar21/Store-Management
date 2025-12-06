const { Router } = require("express");
const { auth } = require("../middlewares/auth.middleware.js");
const { authorizeRoles } = require("../middlewares/role.middleware.js");
const {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cart.controller.js");

const router = Router();

// store users only
router.use(auth, authorizeRoles("store"));

router.post("/", addToCart); // add or increment
router.get("/", getCart);
router.put("/", updateCartItem);
router.delete("/item/:productId", removeFromCart);
router.delete("/", clearCart);

module.exports = router;
