import express from 'express';
import {
    getFechaHoy,
    verificarExistenciaEstudiante, perfilarEstudiante,
    verificarExistenciaEmpleador,

    crearVacante
} from '../controllers/vapiController.js';

const router = express.Router();

router.get('/getFechaHoy', getFechaHoy);
router.post('/verificarExistenciaEstudiante', verificarExistenciaEstudiante);
router.post('/perfilarEstudiante', perfilarEstudiante);

router.post('/verificarExistenciaEmpleador', verificarExistenciaEmpleador);
router.post('/crearVacante', crearVacante);

export default router;