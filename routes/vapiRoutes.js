import express from 'express';
import {
    getFechaHoy,
    verificarExistenciaEstudiante, perfilarEstudiante,
    verificarExistenciaEmpleador
} from '../controllers/vapiController.js';

const router = express.Router();

router.get('/getFechaHoy', getFechaHoy);
router.post('/verificarExistenciaEstudiante', verificarExistenciaEstudiante);
router.post('/perfilarEstudiante', perfilarEstudiante);
router.post('/verificarExistenciaEmpleador', verificarExistenciaEmpleador);

export default router;