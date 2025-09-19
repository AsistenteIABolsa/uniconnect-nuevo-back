//controllers.aplicationController.js
import Application from "../models/Application.js"
import Job from "../models/Job.js"

export const applyToJob = async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body

    // Verificar que el trabajo existe
    const job = await Job.findById(jobId)
    if (!job || job.status !== "active") {
      return res.status(404).json({ message: "Trabajo no encontrado" })
    }

    // Verificar que no haya aplicado antes
    const existingApplication = await Application.findOne({
      job: jobId,
      student: req.user._id,
    })

    if (existingApplication) {
      return res.status(400).json({ message: "Ya has aplicado a este trabajo" })
    }

    // Crear aplicación
    const application = new Application({
      job: jobId,
      student: req.user._id,
      coverLetter,
    })

    await application.save()
    res.status(201).json({ message: "Aplicación enviada exitosamente" })
  } catch (error) {
    console.error("Error aplicando a trabajo:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

export const getStudentApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate({
        path: "job",
        populate: {
          path: "employer",
          select: "profile.companyName firstName lastName",
        },
      })
      .sort({ createdAt: -1 })

    const applicationsWithDetails = applications.map((app) => ({
      ...app.toObject(),
      companyName:
        app.job.employer.profile?.companyName || `${app.job.employer.firstName} ${app.job.employer.lastName}`,
      appliedAt: formatDate(app.createdAt),
    }))

    res.json(applicationsWithDetails)
  } catch (error) {
    console.error("Error obteniendo aplicaciones del estudiante:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

export const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params

    // Verificar que el trabajo pertenece al empleador
    const job = await Job.findOne({ _id: jobId, employer: req.user._id })
    if (!job) {
      return res.status(404).json({ message: "Trabajo no encontrado" })
    }

    const applications = await Application.find({ job: jobId })
      .populate("student", "firstName lastName email phone profile")
      .sort({ createdAt: -1 })

    const applicationsWithDetails = applications.map((app) => ({
      ...app.toObject(),
      appliedAt: formatDate(app.createdAt),
    }))

    res.json(applicationsWithDetails)
  } catch (error) {
    console.error("Error obteniendo aplicaciones del trabajo:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params
    const { status } = req.body

    const application = await Application.findById(applicationId).populate("job")

    if (!application || application.job.employer.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Aplicación no encontrada" })
    }

    application.status = status
    await application.save()

    res.json({ message: "Estado de aplicación actualizado" })
  } catch (error) {
    console.error("Error actualizando estado de aplicación:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

const formatDate = (date) => {
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
