// src/controllers/palestraController.js
// RESPONSÁVEL: Richard
// Controlador para palestras

import { pool } from '../config/db.js'


const palestraIDQuery = async (id) => {
  let output = [] // [código de status HTTP, corpo da resposta (JSON)]

  // Verifica se id é um número inteiro
  if (typeof parseFloat(id) !== "number" || Number.isInteger(parseFloat(id)) !== true) {
    output[0] = 400; output[1] = { Erro: 'O ID do palestra deve ser um número inteiro.' }
    return output
  }

  try {
    const result = await pool.query(`SELECT * FROM palestra WHERE id_palestra = ${id}`)

    if (result.rows[0].visibilidade === "inativo" || result.rows[0].status_interno !== "normal") {
      let status = result.rows[0].visibilidade === "inativo" ? "inativo" : result.rows[0].status_interno
      status = status.slice(0, status.length -1).padEnd(status.length, "a") // Tornando status em um substantivo feminino
      output[0] = 403; output[1] = { Erro: `Esta palestra está ${status}` }
      return output
    }
    
    if (result.rows.length < 1 || result.rows[0].visibilidade === "excluido") {
      output[0] = 404
      output[1] = { Erro: `Não há palestra com ID '${id}.'` }
      return output
    }

    output[0] = 200; output[1] = result.rows[0]
    return output
  } catch (err) {
    console.error('palestraIDQuery:', err.message)
    output[0] = 500; output[1] = { error: err.message }
    return output
  }
}

// Listar palestras
export const listarPalestras = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM palestra ORDER BY id_palestra ASC')
    res.json(result.rows)
  } catch (err) {
    console.error('Erro ao listar palestras:', err.message)
    res.status(500).json({ error: `Erro ao listar palestras: ${err.message}` })
  }
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
  const { id } = req.params

  const id_search = await palestraIDQuery(id)
  res.status(id_search[0]).json(id_search[1])
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
  const { id } = req.params
    
    const user = await palestraIDQuery(id)
    if (user[0] !== 200) {
      res.status(user[0]).json(user[1])
      return
    }
  
    try {
      await pool.query(`UPDATE palestra SET visibilidade = 'excluido' WHERE id_palestra = ${id};`)
      res.status(200).json('Palestra apagada com sucesso.')
    } catch (err) {
      console.error('Erro ao apagar palestra:', err.message)
      res.status(500).json({ error: `Erro ao apagar palestra: ${err.message}` })
    }
}
