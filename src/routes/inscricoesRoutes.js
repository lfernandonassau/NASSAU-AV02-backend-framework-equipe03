// src/routes/inscricoesRoutes.js
// RESPONSÁVEL: Izídio
// Rotas relacionadas às inscrições

import express from 'express'
import {
  listarInscricoes,
  listarMinhasInscricoes,
  buscarInscricaoPorId,
  criarInscricao,
  aceitarInscricao,
  recusarInscricao,
  listarInscricoesEvento
} from '../controllers/inscricaoController.js'

import { authMiddleware } from '../middleware/authMiddleware.js'
import { adminMiddleware } from '../middleware/adminMiddleware.js'
import { rateLimit } from '../middleware/rateLimitMiddleware.js'

const router = express.Router()

// ROTAS

// GET /inscricoes → lista todas as inscrições (apenas admin)
router.get('/', authMiddleware, adminMiddleware, rateLimit(10, 'minutos'), listarInscricoes)

// GET /inscricoes/minhas → lista inscrições do usuário logado
router.get('/minhas', authMiddleware, rateLimit(10, 'minutos'), listarMinhasInscricoes)

// GET /inscricoes/:id → busca inscrição por ID (qualquer usuário autenticado)
router.get('/:id', authMiddleware, rateLimit(20, 'minutos'), buscarInscricaoPorId)

// GET /inscricoes/evento/:idEvento → lista inscrições de um evento (apenas organizador/moderador do evento)
router.get('/evento/:idEvento', authMiddleware, rateLimit(10, 'minutos'), listarInscricoesEvento)

// POST /inscricoes → cria inscrição
router.post('/', authMiddleware, rateLimit(2, 'minutos'), criarInscricao)

// POST /inscricoes/aceitar/:id → aprova inscrição (apenas organizador/moderador do evento)
router.post('/aceitar/:id', authMiddleware, rateLimit(2, 'minutos'), aceitarInscricao)

// POST /inscricoes/recusar/:id → recusa inscrição (apenas organizador/moderador do evento)
router.post('/recusar/:id', authMiddleware, rateLimit(2, 'minutos'), recusarInscricao)

// DEPRECATED: Atualizar e excluir inscrições não faz sentido
// router.put('/:id', authMiddleware, rateLimit(5, 'minutos'), atualizarInscricao)
// router.delete('/:id', authMiddleware, rateLimit(2, 'minutos'), excluirInscricao)

export default router
