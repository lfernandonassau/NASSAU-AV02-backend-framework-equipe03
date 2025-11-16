// src/controllers/palestraController.js
// RESPONSÁVEL: Richard
// Controlador para palestras

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

const ent = new Entidade('palestra', 'Palestra', true, ['titulo', 'id_evento'], ['descricao', 'id_palestrante']) // URGENT: Lógica genérica não inteiramente implementada até resolver o problema descrito no fim do genericController.js

const palestraIDQuery = async (id) => {
  return IDQuery(id, ent)
}

// Listar palestras
export const listarPalestras = async (req, res) => {
  listarColunas(req, res, ent)
}


// Criar palestra
export const criarPalestra = async (req, res) => {
  const { titulo, descricao, data_hora, id_evento } = req.body

  if (!titulo || !data_hora || id_evento) {
    return res.status(400).json({ erro: 'Os campos titulo, data_hora e id_evento devem ser preenchidos.' })
  }

  try {
    const result = await pool.query(`
      INSERT INTO inscricao (id_inscricao, valor, status)
      VALUES ('${titulo}', ${descricao ? `'${descricao}'` : 'NULL'}, '${data_hora}', '${id_evento}')
      RETURNING *;
    `)

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('Erro ao criar palestra:', err.message)
    res.status(500).json({ error: `Erro ao criar palestra: ${err.message}` })
  }
}


// Buscar palestras por ID
export const buscarPalestraPorId = async (req, res) => {
  buscarColunaPorId(req, res, ent)
}


// Atualizar palestras
export const atualizarPalestra = async (req, res) => {
  const { id } = req.params
      const { titulo, descricao, data_hora, id_evento } = req.body
    
      const user = await palestraIDQuery(id)
      if (user[0] !== 200) {
        res.status(user[0]).json(user[1])
        return
      }
    
      let query = []
    
      if (!titulo && !descricao && !data_hora && !id_evento){
        res.status(400).json({ erro: "Nenhum campo para alterar."})
        return
      }
      if (titulo){
        query.push(`titulo = '${titulo}'`)
      }
      if (descricao){
        query.push(`descricao = '${descricao}'`)
      }
      if (data_hora){
        query.push(`data_hora = '${data_hora}'`)
      }
      if (id_evento){
        query.push(`id_evento = '${id_evento}'`)
      }
    
      query = query.toString()
      query.replaceAll("\"", "")
      query.slice(1, query.length - 1)
    
      try {
        const result = await pool.query(`
          UPDATE palestra
          SET ${query}
          WHERE id_palestra = ${id};
          SELECT * FROM palestra WHERE id_palestra = ${id};
        `)
    
        res.status(200).json(result[1].rows[0])
      } catch (err) {
        console.error('Erro ao atualizar palestra:', err.message)
        res.status(500).json({ error: `Erro ao atualizar palestra: ${err.message}` })
      }
}


// Deletar palestras
export const excluirPalestra = async (req, res) => {
  deletarColuna(req, res, ent)
}
