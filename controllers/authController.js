// controllers/authController.js
import User from "../models/User.js"
import TempVerification from "../models/TempVerification.js"
import { generateToken } from "../middleware/auth.js"
import { sendVerificationCode, sendPasswordResetCode } from "../services/emailService.js"

const generateRandomCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Nueva función: Enviar código de verificación
export const sendVerification = async (req, res) => {
  try {
    const { email, firstName, lastName, password, role, phone } = req.body

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "El usuario ya existe" })
    }

    // Generar código de verificación
    const verificationCode = generateRandomCode()
    const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutos

    // Guardar datos temporales
    const tempData = {
      email,
      password,
      firstName,
      lastName,
      role,
      phone
    }

    // Eliminar verificación anterior si existe
    await TempVerification.deleteOne({ email })

    // Guardar nueva verificación
    const tempVerification = new TempVerification({
      email,
      code: verificationCode,
      data: tempData,
      expires
    })

    await tempVerification.save()

    // Enviar código por email
    const emailSent = await sendVerificationCode(email, verificationCode)
    
    if (!emailSent) {
      await TempVerification.deleteOne({ email })
      return res.status(500).json({ message: "Error enviando código de verificación" })
    }

    res.json({ 
      message: "Código de verificación enviado a tu email",
      expiresIn: "10 minutos"
    })
  } catch (error) {
    console.error("Error enviando verificación:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

// Función de registro actualizada
export const register = async (req, res) => {
  try {
    const { email, verificationCode, ...userData } = req.body

    // Buscar verificación temporal
    const tempVerification = await TempVerification.findOne({ 
      email,
      code: verificationCode,
      expires: { $gt: new Date() }
    })

    if (!tempVerification) {
      return res.status(400).json({ message: "Código inválido o expirado" })
    }

    // Verificar si el usuario ya existe (doble verificación)
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      await TempVerification.deleteOne({ email })
      return res.status(400).json({ message: "El usuario ya existe" })
    }

    // Crear perfil según el rol
    let profile = {}
    if (tempVerification.data.role === "estudiante") {
      profile = {
        studentId: userData.studentId,
        major: userData.major,
        graduationYear: userData.graduationYear,
        about: userData.about || "",
        skills: userData.skills || [],
      }
    } else if (tempVerification.data.role === "empleador") {
      profile = {
        companyName: userData.companyName,
        industry: userData.industry,
        companySize: userData.companySize,
        description: userData.description || "",
      }
    }

    // Crear usuario
    const user = new User({
      email: tempVerification.data.email,
      password: tempVerification.data.password,
      firstName: tempVerification.data.firstName,
      lastName: tempVerification.data.lastName,
      role: tempVerification.data.role,
      phone: tempVerification.data.phone,
      profile,
      isVerified: true, // Usuario verificado por email
    })

    await user.save()

    // Limpiar verificación temporal
    await TempVerification.deleteOne({ email })

    res.status(201).json({ message: "Usuario registrado y verificado exitosamente" })
  } catch (error) {
    console.error("Error en registro:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

// Función para reenviar código
export const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body

    // Buscar verificación temporal existente
    const tempVerification = await TempVerification.findOne({ email })
    if (!tempVerification) {
      return res.status(400).json({ message: "No hay verificación pendiente para este email" })
    }

    // Generar nuevo código
    const newCode = generateRandomCode()
    const newExpires = new Date(Date.now() + 10 * 60 * 1000)

    // Actualizar código
    tempVerification.code = newCode
    tempVerification.expires = newExpires
    await tempVerification.save()

    // Enviar nuevo código
    const emailSent = await sendVerificationCode(email, newCode)
    
    if (!emailSent) {
      return res.status(500).json({ message: "Error reenviando código de verificación" })
    }

    res.json({ message: "Código reenviado exitosamente" })
  } catch (error) {
    console.error("Error reenviando código:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

// Función para olvidar contraseña
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" })
    }

    const resetCode = generateRandomCode()
    const resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000)

    user.resetPasswordCode = resetCode
    user.resetPasswordCodeExpires = resetCodeExpires
    await user.save()

    const emailSent = await sendPasswordResetCode(email, resetCode)
    
    if (!emailSent) {
      return res.status(500).json({ message: "Error enviando código de recuperación" })
    }

    res.json({ message: "Se ha enviado un código de recuperación a tu email" })
  } catch (error) {
    console.error("Error en olvidé contraseña:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

// Función para resetear contraseña
export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body

    const user = await User.findOne({ 
      email,
      resetPasswordCode: code,
      resetPasswordCodeExpires: { $gt: new Date() }
    })

    if (!user) {
      return res.status(400).json({ message: "Código inválido o expirado" })
    }

    user.password = newPassword
    user.resetPasswordCode = undefined
    user.resetPasswordCodeExpires = undefined
    await user.save()

    res.json({ message: "Contraseña restablecida exitosamente" })
  } catch (error) {
    console.error("Error restableciendo contraseña:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

// Login function (se mantiene igual)
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
      role: user.role
    })
  } catch (error) {
    console.error("Error en login:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

// Otras funciones se mantienen igual...
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password")
    res.json({ user })
  } catch (error) {
    console.error("Error obteniendo perfil:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}

export const registerAdmin = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, secretKey } = req.body

    // Verificar clave secreta para crear admin
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ message: "Clave secreta inválida" })
    }

    // Verificar si ya existe el usuario
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "El usuario ya existe" })
    }

    // Crear usuario con rol administrador 
    const newAdmin = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
      role: "administrador",
      isVerified: true,
    })

    await newAdmin.save()

    res.status(201).json({
      message: "Administrador registrado exitosamente",
      user: {
        id: newAdmin._id,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    })
  } catch (error) {
    console.error("Error creando administrador:", error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
}