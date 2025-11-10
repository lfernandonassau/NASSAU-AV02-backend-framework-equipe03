// src/routes/inscricoesRoutes.js
// RESPONSÁVEL: Izídio
// Rotas relacionadas às inscrições

import express from 'express'
import {
  listarInscricoes,
  buscarInscricaoPorId,
  criarInscricao,
  atualizarInscricao,
  excluirInscricao
} from '../controllers/inscricaoController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

// CRUD de Inscrições
router.get('/', authMiddleware, listarInscricoes)            // /inscricoes → lista todas
router.get('/:id', authMiddleware, buscarInscricaoPorId)     // /inscricoes/:id → busca por ID
router.post('/', criarInscricao)                            // /inscricoes → cria inscrição
router.put('/:id', authMiddleware, atualizarInscricao)       // /inscricoes/:id → atualiza inscrição
router.delete('/:id', authMiddleware, excluirInscricao)      // /inscricoes/:id → exclui inscrição

export default router
