const { Router } = require("express");
const {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany
} = require("../controllers/company.controller.js");

const { auth } = require("../middlewares/auth.middleware.js");
const { authorizeRoles } = require("../middlewares/role.middleware.js");

const router = Router();

// Admin Only
router.post("/", auth, authorizeRoles("admin"), createCompany);
router.get("/", auth, authorizeRoles("admin"), getAllCompanies);
router.get("/:id", auth, authorizeRoles("admin"), getCompanyById);
router.put("/:id", auth, authorizeRoles("admin"), updateCompany);
router.delete("/:id", auth, authorizeRoles("admin"), deleteCompany);

module.exports = router;
