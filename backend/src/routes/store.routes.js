const { Router } = require("express");
const {
  createStore,
  getAllStores,
  getStoresByCompany,
  getStoreById,
  getMyStoreDetails,
  updateStore,
  deleteStore,
} = require("../controllers/store.controller.js");

const { auth } = require("../middlewares/auth.middleware.js");
const { authorizeRoles } = require("../middlewares/role.middleware.js");

const router = Router();

router.get("/me", auth, authorizeRoles("store"), getMyStoreDetails);

// Admin Routes Only
router.post("/", auth, authorizeRoles("admin"), createStore);
router.get("/", auth, authorizeRoles("admin"), getAllStores);
router.get("/company/:companyId", auth, authorizeRoles("admin"), getStoresByCompany);
router.get("/:id", auth, authorizeRoles("admin"), getStoreById);
router.put("/:id", auth, authorizeRoles("admin"), updateStore);
router.delete("/:id", auth, authorizeRoles("admin"), deleteStore);

module.exports = router;
