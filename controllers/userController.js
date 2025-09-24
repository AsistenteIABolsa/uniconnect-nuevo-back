import User from "../models/User.js"
import Job from "../models/Job.js"
import Application from "../models/Application.js"

export const updateProfile = async (req, res) => {
  try {
    // tomamos todos los campos posibles
    const {
      firstName,
      lastName,
      phone,
      studentId,
      major,
      graduationYear,
      about,
      skills,
      education,
      workExperience,
      projects,
      languages,
      // campos empresa quedan tal cual
      companyName,
      industry,
      companySize,
      description,
    } = req.body

    const updateData = {
      firstName,
      lastName,
      phone,
      studentId,
      major,
      graduationYear,
      about,
      skills,
      education,
      workExperience,
      projects,
      languages,
      companyName,
      industry,
      companySize,
      description,
    }

    const updated = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
    }).select("-password")

    res.json({ message: "Perfil actualizado exitosamente", user: updated })
  } catch (error) {
    console.error("Error actualizando perfil:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 })
    res.json(users)
  } catch (error) {
    console.error("Error obteniendo usuarios:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalStudents = await User.countDocuments({ role: "estudiante" })
    const totalEmployers = await User.countDocuments({ role: "empleador" })
    const totalJobs = await Job.countDocuments({ status: "active" })
    const totalApplications = await Application.countDocuments()

    res.json({
      totalUsers,
      totalStudents,
      totalEmployers,
      totalJobs,
      totalApplications,
    })
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}
