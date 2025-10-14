// config.database.js
import mongoose from "mongoose";
import tls from "tls";

tls.DEFAULT_MIN_VERSION = "TLSv1.2";

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI?.trim(); // quita espacios/saltos de línea
    if (!uri) throw new Error("MONGODB_URI no definida");

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`🍃 MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error?.message);
    process.exit(1);
  }
};
