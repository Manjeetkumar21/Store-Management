const { Router } = require("express");
const {
  createStore,
  getStoresByCompany,
  updateStore,
  deleteStore,
} = require("../controllers/store.controller.js");

const { auth } = require("../middlewares/auth.middleware.js");
const { authorizeRoles } = require("../middlewares/role.middleware.js");

const router = Router();

// Admin Only
router.post("/", auth, authorizeRoles("admin"), createStore);
router.get("/company/:companyId", auth, authorizeRoles("admin"), getStoresByCompany);
router.put("/:id", auth, authorizeRoles("admin"), updateStore);
router.delete("/:id", auth, authorizeRoles("admin"), deleteStore);

module.exports = router;
