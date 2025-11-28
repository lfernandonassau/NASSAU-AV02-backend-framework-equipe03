// src/routes/categoriasRoutes.js
// RESPONSÁVEL: Izídio
// Rotas relacionadas às categorias

import express from 'express'
import {
  listarCategorias,
  buscarCategoriaPorId,
  criarCategoria,
  atualizarCategoria,
  excluirCategoria
} from '../controllers/categoriaController.js'

import { authMiddleware } from '../middleware/authMiddleware.js'
import { adminMiddleware } from '../middleware/adminMiddleware.js'
import { rateLimit } from '../middleware/rateLimitMiddleware.js' 

const router = express.Router()

// CRUD de Categorias
router.get('/', authMiddleware, rateLimit(10, 'minutos'), listarCategorias)                 // /categorias → lista todas
router.get('/:id', authMiddleware, rateLimit(20, 'minutos'), buscarCategoriaPorId)          // /categorias/:id → busca por ID
router.post('/', authMiddleware, adminMiddleware, rateLimit(3, 'minutos'), criarCategoria)  // /categorias → cria categoria
router.put('/:id', authMiddleware, adminMiddleware, rateLimit(5, 'minutos'), atualizarCategoria) // /categorias/:id → atualiza categoria
router.delete('/:id', authMiddleware, adminMiddleware, rateLimit(3, 'minutos'), excluirCategoria) // /categorias/:id → exclui categoria

export default router