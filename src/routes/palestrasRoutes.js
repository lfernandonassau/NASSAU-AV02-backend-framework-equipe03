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

const router = express.Router()

// CRUD de Palestras
router.get('/', listarPalestras)          // /palestras → lista todas
router.get('/:id', buscarPalestraPorId)   // /palestras/:id → busca por ID
router.post('/', criarPalestra)           // /palestras → cria palestra
router.put('/:id', atualizarPalestra)     // /palestras/:id → atualiza palestra
router.delete('/:id', excluirPalestra)    // /palestras/:id → exclui palestra
export default router
