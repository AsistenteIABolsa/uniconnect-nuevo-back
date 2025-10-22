// models/User.js
import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    role: {
      type: String,
      required: true,
      enum: ["estudiante", "empleador", "administrador"],
    },
    phone: String,

    // Campos de verificación
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: String,
    verificationCodeExpires: Date,
    resetPasswordCode: String,
    resetPasswordCodeExpires: Date,

    // Para estudiantes
    studentId: String,
    major: String,
    graduationYear: String,
    semestre: String,
    tipoCarrera: { 
      type: String, 
      enum: ["Técnica", "Tecnológica", "Profesional", "Especialización", "Maestría", "Doctorado"] 
    },
    carrera: String,
    about: String,
    skills: [String],
    egresado: {
      type: Boolean,
      default: false,
    },
    experience: {type: String,default: ""},
    education: [
      {
        institution: String,
        degree: String,
        startDate: String,
        endDate: String,
        description: String,
      },
    ],
    workExperience: [
      {
        company: String,
        position: String,
        startDate: String,
        endDate: String,
        description: String,
      },
    ],
    projects: [
      {
        title: String,
        description: String,
        technologies: [String],
        link: String,
      },
    ],
    languages: [
      {
        name: String,
        level: String,
      },
    ],

    perfiladoPorDanna: {
      type: Boolean,
      default: false,
    },

    vacantePorDanna: {
      type: Boolean,
      default: false,
    },

    // Para empleadores
    companyName: String,
    nit: String,
    industry: String,
    companySize: String,
    description: String,

    // NUEVOS CAMPOS PARA EMPRESA
    mision: String,
    vision: String,
    companyProjects: [
      {
        title: String,
        description: String,
        technologies: [String],
        link: String,
        startDate: String,
        endDate: String,
        status: {
          type: String,
          enum: ["En progreso", "Completado", "Planificado"],
          default: "Planificado"
        }
      },
    ],
    socialMedia: {
      website: String,
      linkedin: String,
      twitter: String,
      facebook: String,
      instagram: String,
      github: String,
    },
    companyProfile: {
      founded: String,
      headquarters: String,
      specialties: [String],
      values: [String],
      culture: String,
      achievements: [String],
    },
    contactEmail: String,
    contactPhone: String,
  },
  {
    timestamps: true,
  },
)

// Hash password antes de guardar
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

// Método para comparar passwords
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password)
}

const User = mongoose.model("User", userSchema)
export default User