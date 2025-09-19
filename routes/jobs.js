//routes.jobs.js
import express from "express"
import { createJob, getJobs, getJobById, getEmployerJobs } from "../controllers/jobController.js"
import { auth, authorize } from "../middleware/auth.js"
import { validateJob } from "../middleware/validation.js"
import { Router } from "express"
import { analisisAplicados } from "../controllers/jobController.js"

const router = express.Router()

router.post("/", auth, authorize("empleador"), validateJob, createJob)
router.get("/", getJobs)
router.get("/employer", auth, authorize("empleador"), getEmployerJobs)
router.get("/:id", getJobById)
router.get("/:jobId/analisis-aplicados", analisisAplicados)

export default router
