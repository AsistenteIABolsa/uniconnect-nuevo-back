import express from 'express';
import {
    verificarExistenciaEstudiante, perfilarEstudiante
} from '../controllers/vapiController.js';

const router = express.Router();

router.post('/verificarExistenciaEstudiante', verificarExistenciaEstudiante);
router.post('/perfilarEstudiante', perfilarEstudiante);

export default router;