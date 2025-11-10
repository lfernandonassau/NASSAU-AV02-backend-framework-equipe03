// src/routes/palestrasRoutes.js
// RESPONSÁVEL: Izídio
// Rotas relacionadas às palestras

import express from 'express'
import {
  listarPalestras,
  buscarPalestraPorId,
  criarPalestra,
  atualizarPalestra,
  excluirPalestra
} from '../controllers/palestraController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

// CRUD de Palestras
router.get('/', authMiddleware, listarPalestras)          // /palestras → lista todas
router.get('/:id', authMiddleware, buscarPalestraPorId)   // /palestras/:id → busca por ID
router.post('/', authMiddleware, criarPalestra)           // /palestras → cria palestra
router.put('/:id', authMiddleware, atualizarPalestra)     // /palestras/:id → atualiza palestra
router.delete('/:id', authMiddleware, excluirPalestra)    // /palestras/:id → exclui palestra

export default router
