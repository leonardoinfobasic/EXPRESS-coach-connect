const express = require("express");
const router = express.Router();

const {
  getProfile,
  updateProfile,
  updateNotifications,
  changePassword,
  getCurrentUser,
  updateCurrentUser,
} = require("../controllers/auth.controller");

const { authJwt } = require("../middlewares/auth.middleware");

const { upload, uploadImage } = require("../controllers/upload.controller");

// ✅ Rotte profilo utente
router.get("/me", authJwt, getCurrentUser);          // GET /users/me
router.put("/me", authJwt, updateCurrentUser);       // PUT /users/me

// ✅ Altre rotte già esistenti
router.get("/profile", authJwt, getProfile);
router.put("/profile", authJwt, updateProfile);
router.put("/notifications", authJwt, updateNotifications);
router.put("/password", authJwt, changePassword);

router.post(
  "/upload-avatar",
  authJwt,
  upload.single("avatar"),
  uploadImage
);

module.exports = router;
