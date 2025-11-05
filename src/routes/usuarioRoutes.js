import express from 'express';
import { listarUsuarios, criarUsuario } from '../controllers/usuarioController.js';

const router = express.Router();

// rotas de exemplo
router.get('/', listarUsuarios);
router.post('/', criarUsuario);

export default router;
