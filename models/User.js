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
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["estudiante", "empleador", "administrador"],
    },
    phone: String,
      // Para estudiantes
      studentId: String,
      major: String,
      graduationYear: String,
      about: String,
      skills: [String],

      // Para empleadores
      companyName: String,
      industry: String,
      companySize: String,
      description: String,
   
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

export default mongoose.model("usuarios", userSchema)
