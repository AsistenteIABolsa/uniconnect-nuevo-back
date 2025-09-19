//controllers.jobController.js
import Job from "../models/Job.js"
import Application from "../models/Application.js"

export const createJob = async (req, res) => {
  try {
    const job = new Job({
      ...req.body,
      employer: req.user._id,
    })

    await job.save()
    res.status(201).json({ message: "Trabajo creado exitosamente", jobId: job._id })
  } catch (error) {
    console.error("Error creando trabajo:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

export const getJobs = async (req, res) => {
  try {
    const { search, location, type, experience } = req.query
    const query = { status: "active" }

    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    if (location) query.location = location
    if (type) query.type = type
    if (experience) query.experience = experience

    const jobs = await Job.find(query)
      .populate("employer", "firstName lastName profile.companyName")
      .sort({ createdAt: -1 })

    const jobsWithDetails = jobs.map((job) => ({
      ...job.toObject(),
      companyName: job.employer.profile?.companyName || `${job.employer.firstName} ${job.employer.lastName}`,
      posted: getTimeAgo(job.createdAt),
    }))

    res.json(jobsWithDetails)
  } catch (error) {
    console.error("Error obteniendo trabajos:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("employer", "firstName lastName profile")

    if (!job || job.status !== "active") {
      return res.status(404).json({ message: "Trabajo no encontrado" })
    }

    const jobWithDetails = {
      ...job.toObject(),
      companyName: job.employer.profile?.companyName || `${job.employer.firstName} ${job.employer.lastName}`,
      companyDescription: job.employer.profile?.description || "",
      posted: formatDate(job.createdAt),
    }

    res.json(jobWithDetails)
  } catch (error) {
    console.error("Error obteniendo trabajo:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

export const getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user._id }).sort({ createdAt: -1 })

    const jobsWithApplications = await Promise.all(
      jobs.map(async (job) => {
        const applicationsCount = await Application.countDocuments({ job: job._id })
        return {
          ...job.toObject(),
          applicationsCount,
        }
      }),
    )

    res.json(jobsWithApplications)
  } catch (error) {
    console.error("Error obteniendo trabajos del empleador:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

const getTimeAgo = (date) => {
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) return "Hace 1 día"
  if (diffDays < 7) return `Hace ${diffDays} días`
  if (diffDays < 14) return "Hace 1 semana"
  if (diffDays < 30) return `Hace ${Math.ceil(diffDays / 7)} semanas`
  return `Hace ${Math.ceil(diffDays / 30)} meses`
}

const formatDate = (date) => {
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
