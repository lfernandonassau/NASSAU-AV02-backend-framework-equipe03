// src/controllers/pagamentoController.js
// RESPONSÁVEL: Richard
// Controlador para pagamentos

import { pool } from '../config/db.js'


const pagamentoIDQuery = async (id) => {
  let output = [] // [código de status HTTP, corpo da resposta (JSON)]
  
  // Verifica se id é um número inteiro
  if (typeof parseFloat(id) !== "number" || Number.isInteger(parseFloat(id)) !== true) {
    output[0] = 400; output[1] = { Erro: 'O ID do pagamento deve ser um número inteiro.' }
    return output
  }

  try {
    const result = await pool.query(`SELECT * FROM pagamento WHERE id_pagamento = ${id}`)

    if (result.rows[0].visibilidade === "inativo" || result.rows[0].status_interno !== "normal") {
      let status = result.rows[0].visibilidade === "inativo" ? "inativo" : result.rows[0].status_interno
      
      output[0] = 403; output[1] = { Erro: `Este pagamento está ${status}` }
      return output
    }
    
    if (result.rows.length < 1 || result.rows[0].visibilidade === "excluido") {
      output[0] = 404
      output[1] = { Erro: `Não há pagamento com ID '${id}.'` }
      return output
    }

    output[0] = 200; output[1] = result.rows[0]
    return output
  } catch (err) {
    console.error('pagamentoIDQuery:', err.message)
    output[0] = 500; output[1] = { error: err.message }
    return output
  }
}

// Listar pagamentos
export const listarPagamentos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pagamento ORDER BY id_pagamento ASC')
    res.json(result.rows)
  } catch (err) {
    console.error('Erro ao listar pagamentos:', err.message)
    res.status(500).json({ error: `Erro ao listar pagamentos: ${err.message}` })
  }
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
  const { id } = req.params

  const id_search = await pagamentoIDQuery(id)
  res.status(id_search[0]).json(id_search[1])
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
  const { id } = req.params
  
    const user = await pagamentoIDQuery(id)
    if (user[0] !== 200) {
      res.status(user[0]).json(user[1])
      return
    }
  
    try {
      await pool.query(`UPDATE pagamento SET visibilidade = 'excluido' WHERE id_pagamento = ${id};`)
      res.status(200).json('Pagamento apagado com sucesso.')
    } catch (err) {
      console.error('Erro ao apagar pagamento:', err.message)
      res.status(500).json({ error: `Erro ao apagar pagamento: ${err.message}` })
    }
}