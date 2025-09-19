//routes.auth.js
import express from "express"
import { register, login, getProfile } from "../controllers/authController.js"
import { auth } from "../middleware/auth.js"
import { validateRegister, validateLogin } from "../middleware/validation.js"

const router = express.Router()

router.post("/register", validateRegister, register)
router.post("/login", validateLogin, login)
router.get("/profile", auth, getProfile)

export default router
