import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { connectDB } from "./config/database.js"
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import jobRoutes from "./routes/jobs.js"
import applicationRoutes from "./routes/applications.js"
import vapiRoutes from "./routes/vapiRoutes.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Conectar a MongoDB sisi
connectDB()

// Rutas
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/jobs", jobRoutes)
app.use("/api/applications", applicationRoutes)
app.use("/vapi", vapiRoutes)

// Ruta de prueba
app.get("/api/health", (req, res) => {
  res.json({
    message: "Backend funcionando correctamente",
    timestamp: new Date().toISOString(),
    database: "MongoDB conectado",
  })
})

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Error interno del servidor" })
})

// Manejo de rutas no encontradas
app.use("*", (req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" })
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🌐 Frontend: http://localhost:5173`)
})
