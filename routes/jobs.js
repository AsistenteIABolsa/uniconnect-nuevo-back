import express from "express"
import { 
  createJob, 
  getJobs, 
  getJobById, 
  getEmployerJobs, 
  updateJob, 
  deleteJob,
  analisisAplicados 
} from "../controllers/jobController.js"
import { auth, authorize } from "../middleware/auth.js"
import { validateJob } from "../middleware/validation.js"

const router = express.Router()

router.post("/", auth, authorize("empleador"), validateJob, createJob)
router.get("/", getJobs)
router.get("/employer", auth, authorize("empleador"), getEmployerJobs)
router.get("/:id", getJobById)
router.put("/:id", auth, authorize("empleador"), validateJob, updateJob) // NUEVA RUTA
router.delete("/:id", auth, authorize("empleador"), deleteJob) // NUEVA RUTA
router.get("/:jobId/analisis-aplicados", analisisAplicados);

export default router