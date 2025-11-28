// src/routes/convitesRoutes.js
// RESPONSÁVEL ORIGINAL: Richard
// RESPONSÁVEL REAL: CT

import express from 'express'

import {
  listarConvites,
  buscarConvitePorId,
  criarConvite,
  criarConviteDiretoEventoUsuario,
  atualizarConvite,
  excluirConvite,
  listarConvitesRecebidos,
  listarConvitesRecebidosDeUsuario,
  listarConvitesEnviados,
  listarConvitesEnviadosDeUsuario,
  listarConvitesPorEvento,
  listarConvitesPorEventoDeUsuario,
  aceitarConvite,
  recusarConvite
} from '../controllers/conviteController.js'

import { authMiddleware } from '../middleware/authMiddleware.js'
import { adminMiddleware } from '../middleware/adminMiddleware.js'
import { rateLimit } from '../middleware/rateLimitMiddleware.js'

const router = express.Router()

// LISTAGENS ESPECÍFICAS

// Convites recebidos
router.get('/recebidos', authMiddleware, rateLimit(10, 'minutos'), listarConvitesRecebidos)
// Convites recebidos de um usuário específico
router.get('/recebidos/:id_usuario', authMiddleware, rateLimit(15, 'minutos'), listarConvitesRecebidosDeUsuario)
// Convites enviados
router.get('/enviados', authMiddleware, rateLimit(10, 'minutos'), listarConvitesEnviados)
// Convites enviados de um usuário específico
router.get('/enviados/:id_usuario', authMiddleware, rateLimit(15, 'minutos'), listarConvitesEnviadosDeUsuario)
// Convite por evento
router.get('/evento/:id_evento', authMiddleware, rateLimit(12, 'minutos'), listarConvitesPorEvento)
// Convite por evento do usuário
router.get('/evento/:id_evento/:id_usuario', authMiddleware, rateLimit(15, 'minutos'), listarConvitesPorEventoDeUsuario)

// Criar convite passando evento + usuário pela URL
router.post(
  '/evento/:id_evento/usuario/:id_usuario',
  authMiddleware,
  rateLimit(3, 'minutos'),
  criarConviteDiretoEventoUsuario
)

// CRUD
router.get('/', authMiddleware, adminMiddleware, rateLimit(10, 'minutos'), listarConvites)
router.get('/:id', authMiddleware, rateLimit(20, 'minutos'), buscarConvitePorId)
router.post('/', authMiddleware, rateLimit(3, 'minutos'), criarConvite)

// Aceitar + recusar
router.post('/:id/aceitar', authMiddleware, rateLimit(3, 'minutos'), aceitarConvite)
router.post('/:id/recusar', authMiddleware, rateLimit(3, 'minutos'), recusarConvite)

router.put('/:id', authMiddleware, rateLimit(5, 'minutos'), atualizarConvite)
router.delete('/:id', authMiddleware, rateLimit(3, 'minutos'), excluirConvite)

export default router
