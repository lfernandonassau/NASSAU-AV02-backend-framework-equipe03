// src/controllers/pagamentoController.js
// RESPONSÁVEL: Richard
// Controlador para pagamentos

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

const ent = new Entidade('pagamento', 'Pagamento', false, ['id_inscricao', 'valor', 'status']) // URGENT: Lógica genérica não inteiramente implementada até resolver o problema descrito no fim do genericController.js

// ID query do pagamento, apagar após completar a implementação de lógica genérica
const pagamentoIDQuery = async (id) => {
  return IDQuery(id, ent)
}

// Listar pagamentos
export const listarPagamentos = async (req, res) => {
  listarColunas(req, res, ent)
}


// Criar pagamentos
export const criarPagamento = async (req, res) => {
  const { id_inscricao, valor, status } = req.body

  if (!id_inscricao || !valor || !status) {
    return res.status(400).json({ erro: 'Todos os campos devem ser preenchidos.' })
  }

  try {
    const result = await pool.query(`
      INSERT INTO pagamento (pagamento, valor, status)
      VALUES ('${id_pagamento}', '${valor}', '${status}')
      RETURNING *;
    `)

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('Erro ao criar pagamento:', err.message)
    res.status(500).json({ error: `Erro ao criar pagamento: ${err.message}` })
  }
}


// Buscar pagamentos por ID
export const buscarPagamentoPorId = async (req, res) => {
  buscarColunaPorId(req, res, ent)
}


// Atualizar pagamentos
export const atualizarPagamento = async (req, res) => {
  const { id } = req.params
    const { id_inscricao, valor, status } = req.body
  
    const user = await pagamentoIDQuery(id)
    if (user[0] !== 200) {
      res.status(user[0]).json(user[1])
      return
    }
  
    let query = []
  
    if (!id_inscricao && !valor && !status){
      res.status(400).json({ erro: "Nenhum campo para alterar."})
      return
    }
    if (id_inscricao){
      query.push(`id_inscricao = '${id_inscricao}'`)
    }
    if (valor){
      query.push(`valor = '${valor}'`)
    }
    if (status){
      query.push(`status = '${status}'`)
    }
  
    query = query.toString()
    query.replaceAll("\"", "")
    query.slice(1, query.length - 1)
  
    try {
      const result = await pool.query(`
        UPDATE pagamento
        SET ${query}
        WHERE id_pagamento = ${id};
        SELECT * FROM pagamento WHERE id_pagamento = ${id};
      `)
  
      res.status(200).json(result[1].rows[0])
    } catch (err) {
      console.error('Erro ao atualizar pagamento:', err.message)
      res.status(500).json({ error: `Erro ao atualizar pagamento: ${err.message}` })
    }
}

// Deletar pagamentos
export const excluirPagamento = async (req, res) => {
  deletarColuna(req, res, ent)
}