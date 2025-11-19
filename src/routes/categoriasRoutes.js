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

const router = express.Router()

// CRUD de Categorias
router.get('/', authMiddleware, listarCategorias)           // /categorias → lista todas
router.get('/:id', authMiddleware, buscarCategoriaPorId)    // /categorias/:id → busca por ID
router.post('/', authMiddleware, criarCategoria)            // /categorias → cria categoria
router.put('/:id', authMiddleware, atualizarCategoria)      // /categorias/:id → atualiza categoria
router.delete('/:id', authMiddleware, excluirCategoria)     // /categorias/:id → exclui categoria

export default router
