import User from "../models/User.js";
import Job from "../models/Job.js";
import mongoose from "mongoose";

// --- Utils ---
function parseDateFlexible(str) {
  if (!str) return null;
  const s = String(str).trim();
  if (!s || s.toLowerCase() === "n/a") return null;

  // Aceptar "DD-MM-YYYY" o "YYYY-MM-DD" o ISO
  const ddmmyyyy = /^(\d{2})-(\d{2})-(\d{4})$/;
  const yyyymmdd = /^(\d{4})-(\d{2})-(\d{2})$/;

  if (ddmmyyyy.test(s)) {
    const [, dd, mm, yyyy] = s.match(ddmmyyyy);
    return `${yyyy}-${mm}-${dd}`; // devolver en YYYY-MM-DD
  }
  if (yyyymmdd.test(s)) return s;

  // Último intento: Date parse
  const d = new Date(s);
  if (!isNaN(d)) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  return null;
}

function toApiDate(str) {
  // Garantiza que lo que respondes al front sea "YYYY-MM-DD" o ""
  const norm = parseDateFlexible(str);
  return norm || "";
}

function normalizeLanguages(input) {
  // Modelo: languages: [ { name, level } ]
  // Body puede traer: { name, level } o array
  if (!input) return [];
  if (Array.isArray(input)) {
    return input
      .map(x => ({ name: x?.name || "", level: x?.level || "" }))
      .filter(x => x.name || x.level);
  }
  if (typeof input === "object") {
    const name = input.name || "";
    const level = input.level || "";
    return (name || level) ? [{ name, level }] : [];
  }
  return [];
}

function normalizeSkills(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(s => String(s).trim()).filter(Boolean);
  // Si llega como string "a, b, c"
  return String(input).split(",").map(s => s.trim()).filter(Boolean);
}

function formatPhoneColombia(phone) {
  const clean = String(phone ?? "")
    .replace(/\s+/g, "")
    .replace(/[^\d]/g, "");
  if (!clean) return "";
  if (clean.startsWith("57")) return `+${clean}`;
  if (clean.startsWith("0")) return `+57${clean.slice(1)}`;
  return `+57${clean}`;
}

function buildWorkExperience({ company, position, startDate, endDate }) {
  const sd = parseDateFlexible(startDate);
  const ed = parseDateFlexible(endDate);
  if (!company && !position && !sd && !ed) return null;
  return {
    company: company || "",
    position: position || "",
    startDate: sd || "",
    endDate: ed || "",
    description: "",
  };
}
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

// --- Controller ---
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
      experienciaLaboral, // viene en body
      company,
      position,
      startDate,
      endDate,
      skills,
      languages,
    } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Falta email." });
    }
    if (!firstName || !lastName || !phone) {
      return res
        .status(400)
        .json({ error: "Faltan datos requeridos: firstName, lastName o phone." });
    }

    // ¿Ya perfilado?
    const yaPerfilado = await User.findOne({ email, perfiladoPorDanna: true });
    if (yaPerfilado) {
      return res.status(409).json({ error: "El usuario ya fue perfilado anteriormente." });
    }

    // Normalizaciones
    const phoneFormatted = formatPhoneColombia(phone);
    const normalizedSkills = normalizeSkills(skills);
    const normalizedLanguages = normalizeLanguages(languages);
    const expBlock = buildWorkExperience({ company, position, startDate, endDate });

    // Armamos el $set
    const setDoc = {
      firstName,
      lastName,
      phone: phoneFormatted,
      carrera: carrera ?? "",
      egresado: Boolean(egresado),
      semestre: semestre ?? "",
      tipoCarrera: tipoCarrera ?? "",
      // Mapear experienciaLaboral -> experience (tu modelo)
      experience: (typeof experienciaLaboral === "string" ? experienciaLaboral : (experienciaLaboral ? "Sí" : "No")),
      skills: normalizedSkills,
      languages: normalizedLanguages,
      perfiladoPorDanna: true,
    };

    // Si vino un bloque de experiencia laboral, lo integramos al arreglo.
    if (expBlock) {
      setDoc.workExperience = [expBlock]; // sobrescribe con 1 item (ajusta según tu regla)
    }

    // Ojo: No modificar email, password ni role aquí.
    const updated = await User.findOneAndUpdate(
      { email },
      { $set: setDoc },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Usuario no encontrado para perfilar." });
    }

    // Prepara respuesta para que el front pinte bien
    const responseUser = {
      _id: updated._id,
      email: updated.email,
      firstName: updated.firstName,
      lastName: updated.lastName,
      phone: updated.phone,
      carrera: updated.carrera,
      egresado: updated.egresado,
      semestre: updated.semestre,
      tipoCarrera: updated.tipoCarrera,
      experience: updated.experience,
      skills: updated.skills,
      languages: (updated.languages || []).map(l => ({
        name: l?.name ?? "",
        level: l?.level ?? "",
      })),
      workExperience: (updated.workExperience || []).map(w => ({
        ...w,
        startDate: toApiDate(w.startDate),
        endDate: toApiDate(w.endDate),
      })),
      perfiladoPorDanna: updated.perfiladoPorDanna,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };

    return res.status(200).json({
      ok: true,
      message: "Usuario perfilado exitosamente.",
      user: responseUser,
    });
  } catch (err) {
    console.error("❌ Error en perfilarEstudiante:", err);
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
