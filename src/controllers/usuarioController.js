import { pool } from '../config/db.js'

// listar usuarios
export const listarUsuarios = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios ORDER BY id ASC')
    res.json(result.rows)
  } catch (err) {
    console.error('erro ao listar usuarios:', err.message)
    res.status(500).json({ error: 'erro ao buscar usuarios' })
  }
}

// Buscar usuario por ID
export const buscarUsuarioPorId = async (req, res) => {

}

// criar usuario
export const criarUsuario = async (req, res) => {
  const { nome, email } = req.body
  if (!nome || !email) return res.status(400).json({ error: 'nome e email obrigatorios' })

  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nome, email) VALUES ($1, $2) RETURNING *',
      [nome, email]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('erro ao criar usuario:', err.message)
    res.status(500).json({ error: 'erro ao criar usuario' })
  }
}

// Atualizar usuario
export const atualizarUsuario = async (req, res) => {

}

// Deletar usuario
export const deletarUsuario = async (req, res) => {

}
