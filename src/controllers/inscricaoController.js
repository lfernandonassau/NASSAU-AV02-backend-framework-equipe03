// src/controllers/inscricaoController.js
// RESPONSÁVEL: Richard
// Controlador para inscrições

import {
  Entidade,
  IDQuery,
  listarColunas,
  buscarColunaPorId,
  criarColuna,
  atualizarColuna,
  deletarColuna
} from "./genericController.js"
import { pool } from '../config/db.js'

const ent = new Entidade('inscricao', 'Inscrição', true, ['id_usuario', 'id_evento', 'status'], [], 'Inscrições') // URGENT: Lógica genérica não inteiramente implementada até resolver o problema descrito no fim do genericController.js

// ID query da inscrição, apagar após completar a implementação de lógica genérica
const inscricaoIDQuery = async (id) => {
  return IDQuery(id, ent)
}

// Listar inscrição
export const listarInscricoes = async (req, res) => {
  listarColunas(req, res, ent)
}


// Criar inscrição
export const criarInscricao = async (req, res) => {
  const { id_usuario, id_evento, status } = req.body

  if (!id_usuario || !id_evento || !status) { // é necessário incluir o status? perguntar depois
    return res.status(400).json({ erro: `Todos os campos a seguir devem ser preenchidos:
      id_usuario
      id_evento
      status
      `})
  }

  try {
    const result = await pool.query(`
      INSERT INTO inscricao (id_usuario, id_evento, status)
      VALUES ('${id_usuario}', '${id_evento}', '${status}')
      RETURNING *;
    `)

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('Erro ao criar inscrição:', err.message)
    res.status(500).json({ error: `Erro ao criar inscrição: ${err.message}` })
  }
}


// Buscar inscrição por ID
export const buscarInscricaoPorId = async (req, res) => {
  buscarColunaPorId(req, res, ent)
}


// Atualizar inscrição
export const atualizarInscricao = async (req, res) => {
  const { id } = req.params
  const { id_usuario, id_evento, status } = req.body

  const user = await inscricaoIDQuery(id)
  if (user[0] !== 200) {
    res.status(user[0]).json(user[1])
    return
  }

  let query = []

  if (!id_usuario && !id_evento && !status){
    res.status(400).json({ erro: "Nenhum campo para alterar."})
    return
  }
  if (id_usuario){
    query.push(`id_usuario = '${id_usuario}'`)
  }
  if (id_evento){
    query.push(`id_evento = '${id_evento}'`)
  }
  if (status){
    query.push(`status = '${status}'`)
  }

  query = query.toString()
  query.replaceAll("\"", "")
  query.slice(1, query.length - 1)

  try {
    const result = await pool.query(`
      UPDATE inscricao
      SET ${query}
      WHERE id_inscricao = ${id};
      SELECT * FROM inscricao WHERE id_inscricao = ${id};
    `)

    res.status(200).json(result[1].rows[0])
  } catch (err) {
    console.error('Erro ao atualizar usuario:', err.message)
    res.status(500).json({ error: `Erro ao atualizar usuario: ${err.message}` })
  }
}

// Deletar inscrição
export const excluirInscricao = async (req, res) => {
  deletarColuna(req, res, ent)
}