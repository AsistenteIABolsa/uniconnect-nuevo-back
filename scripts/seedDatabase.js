import dotenv from "dotenv"
import User from "../models/User.js"
import Job from "../models/Job.js"
import { connectDB } from "../config/database.js"

dotenv.config()

const seedData = async () => {
  try {
    await connectDB()

    // Limpiar datos existentes
    await User.deleteMany({})
    await Job.deleteMany({})

    // Crear usuarios de ejemplo
    const admin = new User({
      email: "admin@universidad.edu",
      password: "password",
      firstName: "Admin",
      lastName: "Universidad",
      role: "administrador",
      phone: "555-0001",
    })

    const student = new User({
      email: "juan.perez@universidad.edu",
      password: "password",
      firstName: "Juan",
      lastName: "Pérez",
      role: "estudiante",
      phone: "555-0002",
      profile: {
        studentId: "E12345678",
        major: "Ingeniería en Sistemas",
        graduationYear: "2025",
        about: "Estudiante apasionado por el desarrollo web",
        skills: ["JavaScript", "React", "Node.js", "HTML/CSS", "Git", "SQL"],
      },
    })

    const employer = new User({
      email: "maria.lopez@empresa.com",
      password: "password",
      firstName: "María",
      lastName: "López",
      role: "empleador",
      phone: "555-0003",
      profile: {
        companyName: "TechCorp Solutions",
        industry: "tech",
        companySize: "medium",
        description: "Empresa líder en desarrollo de software",
      },
    })

    await admin.save()
    await student.save()
    await employer.save()

    // Crear trabajos de ejemplo
    const job1 = new Job({
      employer: employer._id,
      title: "Desarrollador Frontend",
      description: "Estamos buscando un Desarrollador Frontend talentoso para unirse a nuestro equipo de ingeniería.",
      requirements: [
        "Licenciatura en Ingeniería en Sistemas",
        "Experiencia con React y JavaScript",
        "Conocimiento de HTML/CSS",
      ],
      responsibilities: [
        "Desarrollar interfaces de usuario responsivas",
        "Colaborar con diseñadores",
        "Optimizar aplicaciones",
      ],
      benefits: ["Salario competitivo", "Horario flexible", "Seguro médico"],
      skills: ["JavaScript", "React", "HTML/CSS", "Tailwind CSS", "Git"],
      location: "Ciudad de México",
      type: "Tiempo completo",
      mode: "Híbrido",
      salary: "$18,000 - $25,000 MXN",
      experience: "0-2 años",
      education: "Licenciatura",
    })

    const job2 = new Job({
      employer: employer._id,
      title: "Desarrollador Backend",
      description: "Buscamos un Desarrollador Backend para trabajar en nuestros servicios y APIs.",
      requirements: ["Experiencia con Node.js", "Conocimiento de bases de datos", "APIs REST"],
      responsibilities: ["Desarrollar APIs REST", "Mantener bases de datos", "Optimizar rendimiento"],
      benefits: ["Salario competitivo", "Trabajo remoto", "Capacitación continua"],
      skills: ["Node.js", "Express", "MongoDB", "API REST", "SQL"],
      location: "Guadalajara",
      type: "Medio tiempo",
      mode: "Remoto",
      salary: "$15,000 - $20,000 MXN",
      experience: "0-1 años",
      education: "Licenciatura",
    })

    await job1.save()
    await job2.save()

    console.log("✅ Base de datos poblada exitosamente")
    process.exit(0)
  } catch (error) {
    console.error("❌ Error poblando base de datos:", error)
    process.exit(1)
  }
}

seedData()
