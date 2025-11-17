// src/controllers/categoriaController.js
// RESPONSÁVEL: Richard
// Controlador para categorias dos eventos

import {
  Entidade,
  listarColunas,
  buscarColunaPorId,
  criarColuna,
  atualizarColuna,
  deletarColuna
} from "./genericController.js"

const ent = new Entidade('categoria', 'Categoria', true, ['nome'], ['descricao'])

// Listar todas as categorias
export const listarCategorias = async (req, res) => {
  listarColunas(req, res, ent)
}

// Buscar categoria por ID
export const buscarCategoriaPorId = async (req, res) => {
  buscarColunaPorId(req, res, ent)
}

// Criar nova categoria
export const criarCategoria = async (req, res) => {
  criarColuna(req, res, ent)
}

// Atualizar categoria existente
export const atualizarCategoria = async (req, res) => {
  atualizarColuna(req, res, ent)
}

// Excluir categoria
export const excluirCategoria = async (req, res) => {
  deletarColuna(req, res, ent)
}
