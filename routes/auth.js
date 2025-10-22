// routes/auth.js
import express from "express"
import { register, login, getProfile, registerAdmin } from "../controllers/authController.js"
import { auth } from "../middleware/auth.js"
import { validateRegister, validateLogin } from "../middleware/validation.js"

const router = express.Router()

router.post("/register", validateRegister, register)
router.post("/login", validateLogin, login)
router.get("/profile", auth, getProfile)
router.post("/register-admin", registerAdmin)

export default router
