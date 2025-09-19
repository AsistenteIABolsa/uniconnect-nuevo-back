//routes.applications.js
import express from "express"
import {
  applyToJob,
  getStudentApplications,
  getJobApplications,
  updateApplicationStatus,
} from "../controllers/applicationController.js"
import { auth, authorize } from "../middleware/auth.js"

const router = express.Router()

router.post("/", auth, authorize("estudiante"), applyToJob)
router.get("/student", auth, authorize("estudiante"), getStudentApplications)
router.get("/job/:jobId", auth, authorize("empleador"), getJobApplications)
router.patch("/:applicationId", auth, authorize("empleador"), updateApplicationStatus)

export default router
