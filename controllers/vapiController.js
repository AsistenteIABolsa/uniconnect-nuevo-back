import User from "../models/User.js";
import Job from "../models/Job.js";
import mongoose from "mongoose";

//aqui van controladores de vapi

export const getFechaHoy = (req, res) => {
  try {
    const now = dayjs().tz();

    const fechaHoy = now.format("DD-MM-YYYY"); // ejemplo: 10-09-2025
    const diaHoy = now.format("dddd");         // ejemplo: "miércoles"
    const horaActual = now.format("HH:mm");    // ejemplo: "10:05"

    res.set("Cache-Control", "no-store");

    return res.json({
      fechaHoy,
      diaHoy,
      horaActual,
      tz: "America/Bogota",
    });
  } catch (error) {
    console.error("❌ Error en getFechaHoy:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
};

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

export const verificarExistenciaEmpleador = async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({ ok: false, error: "Falta email" });
    }

    // Buscar empleador
    const empleador = await User.findOne({ email }, "firstName lastName phone email vacanteCreadaPorDanna").lean();

    if (!empleador /*|| empleador.vacanteCreadaPorDanna === false*/) {
      return res.json({
        ok: true,
        exists: false,
        tieneVacantes: false,
        queriedEmail: email
      });
    }

    // Buscar vacantes asociadas a este empleador
    const vacantes = await Job.find(
      { employer: empleador._id, status: "active" },
      "title location type mode"
    ).lean();

    return res.json({
      ok: true,
      exists: true,
      empleador: {
        nombreCompleto: `${empleador.firstName} ${empleador.lastName}`,
        phone: empleador.phone || "No especificado",
        email: empleador.email || "No especificado"
      },
      vacantesActivas: vacantes.map(v => ({
        titulo: v.title || "No especificado",
        ubicacion: v.location || "No especificado",
        tipoEmpleo: v.type || "No especificado",
        modalidad: v.mode || "No especificado"
      })),
      queriedEmail: email,
    });
  } catch (err) {
    console.error("❌ Error en verificarExistenciaEmpleador:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
};

export const crearVacante = async (req, res) => {
  try {
    const {
        email,
        titulo,
        descripcion,
        ubicacion,
        tipoEmpleo,
        modalidad,
        salario,
        experiencia,
        habilidades,
        responsabilidades,
        requisitos,
        beneficios,
      
    } = req.body;

    if (!email || !titulo ||!descripcion || !ubicacion || !tipoEmpleo) {
      return res.status(400).json({ error: "Faltan datos requeridos para crear la vacante." });
    }

    // Verifica si el empleador existe
    const empleador = await User.findOne({ email: email });
    if (!empleador) {
      console.log("⚠️ Intento de crear una vacante desde un empleador no existente.");
      return res.status(404).json({ error: "El empleador no existe" });
    }

    // Solo actualiza los campos nuevos, sin modificar email, password ni role
    const newVacante = await Job.create(
      {
        employer: empleador._id,
        title: titulo,
        description: descripcion,
        requirements: requisitos,
        responsibilities: responsabilidades,
        benefits: beneficios,
        skills: habilidades,
        location: ubicacion,
        type: tipoEmpleo,
        mode: modalidad,
        salary: salario,
        experience: experiencia,
        status: "active",
        vacanteCreadaPorDanna: true
      }
    );

    if (!empleador) {
      return res.status(404).json({ error: "Vacante no encontrada para crear." });
    }

    console.log("✅ Vacante creada correctamente.");

    return res.status(200).json({
      ok: true,
      message: "Vacante creada exitosamente.",
      vacante: newVacante
    });
  } catch (err) {
    console.error("❌ Error en crearVacante:", err);
    return res.status(500).json({ error: "Error interno del servidor", detalle: err.message });
  }
};
