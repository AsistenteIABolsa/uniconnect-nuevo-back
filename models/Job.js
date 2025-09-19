//models.Job.js
import mongoose from "mongoose"

const jobSchema = new mongoose.Schema(
  {
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    requirements: [String],
    responsibilities: [String],
    benefits: [String],
    skills: [String],
    location: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Tiempo completo", "Medio tiempo", "Prácticas", "Freelance"],
    },
    mode: {
      type: String,
      enum: ["Presencial", "Remoto", "Híbrido"],
    },
    salary: String,
    experience: String,
    education: String,
    status: {
      type: String,
      default: "active",
      enum: ["active", "inactive", "closed"],
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("Job", jobSchema)
