// models/TempVerification.js
import mongoose from "mongoose"

const tempVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    required: true
  },
  expires: {
    type: Date,
    required: true,
    index: { expires: '10m' } // Expira después de 10 minutos
  }
}, {
  timestamps: true
})

export default mongoose.model("TempVerification", tempVerificationSchema)