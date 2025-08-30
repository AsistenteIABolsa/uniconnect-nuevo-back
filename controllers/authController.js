import User from "../models/User.js"
import { generateToken } from "../middleware/auth.js"

export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, ...profileData } = req.body

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "El usuario ya existe" })
    }

    // Crear perfil según el rol
    let profile = {}
    if (role === "estudiante") {
      profile = {
        studentId: profileData.studentId,
        major: profileData.major,
        graduationYear: profileData.graduationYear,
        about: profileData.about || "",
        skills: profileData.skills || [],
      }
    } else if (role === "empleador") {
      profile = {
        companyName: profileData.companyName,
        industry: profileData.industry,
        companySize: profileData.companySize,
        description: profileData.description || "",
      }
    }

    // Crear usuario
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role,
      phone: profileData.phone,
      profile,
    })

    await user.save()

    res.status(201).json({ message: "Usuario registrado exitosamente" })
  } catch (error) {
    console.error("Error en registro:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Buscar usuario
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" })
    }

    // Verificar contraseña
    const isValidPassword = await user.comparePassword(password)
    if (!isValidPassword) {
      return res.status(401).json({ message: "Credenciales inválidas" })
    }

    // Generar token
    const token = generateToken(user._id)

    // Remover contraseña de la respuesta
    const userResponse = user.toObject()
    delete userResponse.password

    res.json({
      token,
      user: userResponse,
    })
  } catch (error) {
    console.error("Error en login:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password")
    res.json({ user })
  } catch (error) {
    console.error("Error obteniendo perfil:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}
