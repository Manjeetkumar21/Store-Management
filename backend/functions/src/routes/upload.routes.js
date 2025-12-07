const express = require("express");
const {
  uploadStoreNavbarImage,
  uploadStoreFooterImage,
  uploadStoreHeroImage,
  uploadProductImage,
} = require("../controllers/upload.controller.js");
const { auth } = require("../middlewares/auth.middleware.js");
const { authorizeRoles } = require("../middlewares/role.middleware.js");
const router = express.Router();

router.put("/store/:id/upload-navbar", auth, authorizeRoles("admin"), uploadStoreNavbarImage);
router.put("/store/:id/upload-footer", auth, authorizeRoles("admin"), uploadStoreFooterImage);
router.put("/store/:id/upload-hero", auth, authorizeRoles("admin"), uploadStoreHeroImage);
router.put("/product/:id/upload", auth, authorizeRoles("admin"), uploadProductImage);

module.exports = router;
