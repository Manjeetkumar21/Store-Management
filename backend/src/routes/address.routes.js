const { Router } = require("express");
const { auth } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const {
  createAddress,
  getStoreAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("../controllers/address.controller");

const router = Router();

// All routes require store authentication
router.use(auth);
router.use(authorizeRoles("store"));

// Address CRUD routes
router.post("/", createAddress);
router.get("/", getStoreAddresses);
router.get("/:id", getAddressById);
router.put("/:id", updateAddress);
router.delete("/:id", deleteAddress);
router.patch("/:id/default", setDefaultAddress);

module.exports = router;
