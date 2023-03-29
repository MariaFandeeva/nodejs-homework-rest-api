const express = require("express");
const router = express.Router();
const { getCurrent, ctrlWrapper, upload, auth } = require("../../middlewares");

const {
  register,
  verifyEmail,
  resendVerifyEmail,
  login,
  getCurrentUser,
  updateAvatar,
  logout,
  updateSubscription,
  deleteUserByEmail,
} = require("../../controllers");

router.post("/register", ctrlWrapper(register));
router.get("/verification/:verificationToken", ctrlWrapper(verifyEmail));
router.post("/verify", ctrlWrapper(resendVerifyEmail));
router.post("/login", ctrlWrapper(login));
router.get("/current", auth, getCurrent, ctrlWrapper(getCurrentUser));
router.post("/logout", auth, getCurrent, ctrlWrapper(logout));
router.patch(
  "/subscription",
  auth,
  getCurrent,
  ctrlWrapper(updateSubscription)
);
router.patch(
  "/avatars",
  getCurrent,
  upload.single("avatar"),
  ctrlWrapper(updateAvatar)
);
router.delete("/", auth, deleteUserByEmail);

module.exports = router;
