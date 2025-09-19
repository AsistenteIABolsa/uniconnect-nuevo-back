import mongoose from "mongoose"
import dotenv from "dotenv"
import User from '../models/User.js';


dotenv.config()

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)

    const exists = await User.findOne({ email: "admin@prueba.com" })
    if (exists) {
      console.log("⚠️ El admin ya existe")
      process.exit(0)
    }

    const admin = new User({
      email: "admin1@gmail.com",
      password: "Admin1234", // se hasheará automáticamente por el pre("save")
      firstName: "Super",
      lastName: "Admin",
      role: "administrador",
      phone: "1234567890"
    })

    await admin.save()
    console.log("✅ Admin creado con éxito")
    process.exit(0)
  } catch (error) {
    console.error("❌ Error creando admin:", error)
    process.exit(1)
  }
}

seedAdmin()
