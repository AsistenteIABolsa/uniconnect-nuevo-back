// routes/auth.js
// routes/auth.js
import express from "express"
import { 
  register, 
  login, 
  getProfile, 
  registerAdmin, 
  sendVerification,
  resendVerificationCode,
  forgotPassword,
  resetPassword 
} from "../controllers/authController.js"
import { auth } from "../middleware/auth.js"
import { validateRegister, validateLogin } from "../middleware/validation.js"

const router = express.Router()

router.post("/send-verification", sendVerification)
router.post("/register", validateRegister, register)
router.post("/resend-verification", resendVerificationCode)
router.post("/login", validateLogin, login)
router.get("/profile", auth, getProfile)
router.post("/register-admin", registerAdmin)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)

export default router