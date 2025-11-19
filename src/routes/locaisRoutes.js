// src/routes/locaisRoutes.js
// RESPONSÁVEL: Izídio
// Rotas relacionadas aos locais dos eventos

import express from 'express'
import {
  listarLocais,
  buscarLocalPorId,
  criarLocal,
  atualizarLocal,
  excluirLocal
} from '../controllers/localController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

// CRUD de Locais
router.get('/', authMiddleware, listarLocais)           // /locais → lista todos
router.get('/:id', authMiddleware, buscarLocalPorId)    // /locais/:id → busca por ID
router.post('/', authMiddleware, criarLocal)            // /locais → cria local
router.put('/:id', authMiddleware, atualizarLocal)      // /locais/:id → atualiza local
router.delete('/:id', authMiddleware, excluirLocal)     // /locais/:id → exclui local

export default router
