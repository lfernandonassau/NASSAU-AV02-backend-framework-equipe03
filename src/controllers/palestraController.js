// src/controllers/palestraController.js
// RESPONSÁVEL: Richard
// Controlador para palestras

import {
  Entidade,
  listarColunas,
  buscarColunaPorId,
  criarColuna,
  atualizarColuna,
  deletarColuna
} from "./genericController.js"

const ent = new Entidade('palestra', 'Palestra', true, ['titulo', 'id_evento'], ['descricao', 'id_palestrante'])

// Listar palestras
export const listarPalestras = async (req, res) => {
  listarColunas(req, res, ent)
}


// Criar palestra
export const criarPalestra = async (req, res) => {
  criarColuna(req, res, ent)
}


// Buscar palestras por ID
export const buscarPalestraPorId = async (req, res) => {
  buscarColunaPorId(req, res, ent)
}


// Atualizar palestras
export const atualizarPalestra = async (req, res) => {
  atualizarColuna(req, res, ent)
}


// Deletar palestras
export const excluirPalestra = async (req, res) => {
  deletarColuna(req, res, ent)
}
