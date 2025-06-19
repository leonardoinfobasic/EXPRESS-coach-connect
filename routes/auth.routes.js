const express = require("express")
const { register, login, getProfile, forgotPassword } = require("../controllers/auth.controller")
const { authJwt } = require("../middlewares/auth.middleware")
const { resetPasswordByEmail } = require("../controllers/auth.controller");

const router = express.Router()

// Registrazione
router.post("/register", register)

// Login
router.post("/login", login)

// Profilo utente (protetto)
router.get("/profile", authJwt, getProfile)

// Rotte per il recupero password
router.post("/forgot-password", forgotPassword);

// Rotta per il reset della password tramite email
router.post("/reset-password", resetPasswordByEmail);

module.exports = router
