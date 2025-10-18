// src/routes/containersRoutes.js

const express = require('express');
const router = express.Router();

// --- Ponto de Atenção 1: Importar o Controller de Containers Real ---
const containersController = require('../controllers/containersController');

const containersController = {
    // Funções do Container
    list: (req, res) => res.json({ message: "Rota: GET /api/containers - Pronto para Listar Containers" }),
    create: (req, res) => res.json({ message: "Rota: POST /api/containers - Pronto para Criar Container" }),
    update: (req, res) => res.json({ message: `Rota: PUT /api/containers/${req.params.id} - Pronto para Editar Container` }),
    delete: (req, res) => res.json({ message: `Rota: DELETE /api/containers/${req.params.id} - Pronto para Apagar Container` }),
    move: (req, res) => res.json({ message: `Rota: POST /api/containers/${req.params.id}/move - Pronto para Mover Container` }),
    
    // Funções do Item dentro do Container
    addItem: (req, res) => res.json({ message: `Rota: POST /api/containers/${req.params.containerId}/items - Pronto para Atribuir Item` }),
    editItemInPosition: (req, res) => res.json({ message: `Rota: PATCH /api/containers/${req.params.containerId}/items/${req.params.itemId} - Pronto para Editar Item na Posição` }),
    deleteItemInPosition: (req, res) => res.json({ message: `Rota: DELETE /api/containers/${req.params.containerId}/items/${req.params.itemId} - Pronto para Apagar Item na Posição` }),
};

// =================================================================
// ROTAS DE CONTAINERS E SUAS OPERAÇÕES BÁSICAS (/api/containers)
// =================================================================

// [GET] /api/containers
// Objetivo: Listar todos os containers.
router.get('/', containersController.list);

// [POST] /api/containers
// Objetivo: Criar um novo container.
router.post('/', containersController.create);


// [PUT] /api/containers/:id
// Objetivo: Editar (substituir completamente) um container específico.
router.put('/:id', containersController.update);

// [DELETE] /api/containers/:id
// Objetivo: Apagar um container específico.
router.delete('/:id', containersController.delete);


// [POST] /api/containers/:id/move
// Objetivo: Ação específica para mover o container.
router.post('/:id/move', containersController.move);


// =================================================================
// ROTAS PARA OPERAÇÕES COM ITENS DENTRO DO CONTAINER
// =================================================================

// [POST] /api/containers/:containerId/items
// Objetivo: Atribuir/Adicionar um item existente a este container.
router.post('/:containerId/items', containersController.addItem);

// [PATCH] /api/containers/:containerId/items/:itemId
// Objetivo: Editar dados de um item específico DENTRO do container (ex: mudar posição, atualizar status interno).
router.patch('/:containerId/items/:itemId', containersController.editItemInPosition);

// [DELETE] /api/containers/:containerId/items/:itemId
// Objetivo: Remover um item DENTRO do container (mas não apagar o item permanentemente).
router.delete('/:containerId/items/:itemId', containersController.deleteItemInPosition);

module.exports = router;