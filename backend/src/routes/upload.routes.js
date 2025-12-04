const express = require("express");
const upload = require("../middlewares/multer.middleware.js");
const {
  uploadStoreImage,
  uploadProductImage,
} = require("../controllers/upload.controller.js");
const { auth } = require("../middlewares/auth.middleware.js");
const { authorizeRoles } = require("../middlewares/role.middleware.js");
const router = express.Router();

router.put("/store/:id/upload", auth, authorizeRoles("admin"), upload.single("image"), uploadStoreImage);
router.put( "/product/:id/upload", auth, authorizeRoles("admin"), upload.single("image"), uploadProductImage);

module.exports = router;
