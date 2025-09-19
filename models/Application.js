//models.Application.js
import mongoose from "mongoose"

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coverLetter: String,
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "reviewed", "accepted", "rejected"],
    },
  },
  {
    timestamps: true,
  },
)

// Índice único para evitar aplicaciones duplicadas
applicationSchema.index({ job: 1, student: 1 }, { unique: true })

export default mongoose.model("Application", applicationSchema)
