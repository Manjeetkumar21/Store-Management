const { Router } = require("express");
const { getMyProfile, updateMyProfile } = require("../controllers/user.controller.js");
const { auth } = require("../middlewares/auth.middleware.js");

const router = Router();

router.get("/me", auth, getMyProfile);
router.put("/me", auth, updateMyProfile);

module.exports = router;
