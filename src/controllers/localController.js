// src/controllers/localController.js
// RESPONSÁVEL: Richard
// Controlador para locais dos eventos

import {
  Entidade,
  listarColunas,
  buscarColunaPorId,
  criarColuna,
  atualizarColuna,
  deletarColuna
} from "./genericController.js"

const ent = new Entidade('local', 'Local', false, ['nome'], ['endereco', 'capacidade'], 'Locais')

// Listar todos os locais
export const listarLocais = async (req, res) => {
  listarColunas(req, res, ent)
}

// Buscar local por ID
export const buscarLocalPorId = async (req, res) => {
  buscarColunaPorId(req, res, ent)
}

// Criar novo local
export const criarLocal = async (req, res) => {
  criarColuna(req, res, ent)
}

// Atualizar local existente
export const atualizarLocal = async (req, res) => {
  atualizarColuna(req, res, ent)
}

// Excluir local
export const excluirLocal = async (req, res) => {
  deletarColuna(req, res, ent)
}
