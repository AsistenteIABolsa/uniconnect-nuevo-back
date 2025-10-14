//routes.users.js
import express from "express"
import { updateProfile, getUsers, getUserStats } from "../controllers/userController.js"
import { auth, authorize } from "../middleware/auth.js"

const router = express.Router()

router.put("/profile", auth, updateProfile)
router.get("/", auth, authorize("administrador"), getUsers)
router.get("/stats", auth, authorize("administrador"), getUserStats)

export default router