import User from "../models/User.js";
import Job from "../models/Job.js";
import mongoose from "mongoose";

//aqui van controladores de vapi

export const verificarExistenciaEstudiante = async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({ ok: false, error: "Falta email" });
    }

    // Consulta en la colección
    const estudiante = await User.findOne({ email },
      "firstName lastName phone email perfiladoPorDanna " // ← Solo trae esos campos
    ).lean();

    if (!estudiante) {
      return res.json({ 
        ok: true, 
        exists: false, 
        queriedEmail: email });
    }

    if (estudiante.perfiladoPorDanna === false) {
      return res.json({
        ok: true,
        perfilCompletado: false,
        estudiante: estudiante._id,
        queriedEmail: email,
      });
    }

    return res.json({
      ok: true,
      exists: true,
      estudiante: {
        nombreCompleto: (estudiante.firstName + ` ${estudiante.lastName}`),
        phone: estudiante.phone || "No especificado",
        email: estudiante.email || "No especificado"

      },
      queriedEmail: email,
    });
  } catch (err) {
    console.error("❌ Error en verificarExistenciaEstudiante:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

export const perfilarEstudiante = async (req, res) => {
  try {
    const {
        email,
        firstName,
        lastName,
        phone,
        carrera,
        egresado,
        semestre,
        tipoCarrera,
        experienciaLaboral,
        
        company,
        position,
        startDate,
        endDate,
        skills,
        languages,
      
    } = req.body;

    if (!firstName || !lastName || !phone) {
      return res.status(400).json({ error: "Faltan datos requeridos para crear el paciente." });
    }

    // Verifica si el paciente ya existe
    const existe = await User.findOne({ email: email, perfiladoPorDanna: true });
    if (existe) {
      console.log("⚠️ Intento de perfilar un usuario ya perfilado.");
      return res.status(409).json({ error: "El paciente ya fue perfilado anteriormente" });
    }

    // Actualiza el usuario existente con los nuevos datos perfilados
    // Formatea el teléfono para que siempre tenga el prefijo +57
    const formatPhoneNumber = (phone) => {
      const clean = phone.toString().replace(/\D/g, '');
      if (clean.startsWith('57')) return `+${clean}`;
      if (clean.startsWith('0')) return `+57${clean.slice(1)}`;
      return `+57${clean}`;
    };
    const phoneFormatted = formatPhoneNumber(phone);

    // Solo actualiza los campos nuevos, sin modificar email, password ni role
    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          firstName,
          lastName,
          phone: phoneFormatted,
          carrera,
          egresado,
          semestre,
          tipoCarrera,
          experienciaLaboral,
          company,
          position,
          startDate,
          endDate,
          skills,
          languages,
          perfiladoPorDanna: true
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "Usuario no encontrado para perfilar." });
    }

    console.log("✅ Usuario perfilado correctamente.");

    return res.status(200).json({
      ok: true,
      message: "Usuario perfilado exitosamente.",
      user: updatedUser
    });
  } catch (err) {
    console.error("❌ Error en perfilarEstudianteUniconnect:", err);
    return res.status(500).json({ error: "Error interno del servidor", detalle: err.message });
  }
};