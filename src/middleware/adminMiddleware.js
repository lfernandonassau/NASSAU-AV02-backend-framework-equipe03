// src/middleware/adminMiddleware.js
// RESPONSÁVEL: CT
import { pool } from '../config/db.js'

export const adminMiddleware = async (req, res, next) => {
  try {
    const userId = req.userId

    if (!userId) {
      return res.status(401).json({
        message: 'Usuário não autenticado.'
      })
    }

    // Consulta o tipo do usuário no banco
    const query = `
      SELECT tipo 
      FROM usuario 
      WHERE id_usuario = $1 AND visibilidade = 'ativo'
    `
    const result = await pool.query(query, [userId])

    // Se não achar usuário
    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Usuário não encontrado.'
      })
    }

    const usuario = result.rows[0]

    // Verifica se é ADMIN (organizador)
    if (usuario.tipo !== 'organizador') {
      return res.status(403).json({
        message: 'Você não possui permissão para acessar este recurso.'
      })
    }

    // Tudo certo
    next()

  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao verificar permissões.',
      error: error.message
    })
  }
}
