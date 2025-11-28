// src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken'

export const tokenBlacklist = new Set()
const FLIP_BYPASS = 1

export const authMiddleware = (req, res, next) => {
  if (FLIP_BYPASS === 0) return next()

  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido.' })
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : authHeader

  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ message: 'Token expirado (logout realizado).' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.userId = decoded.id_usuario
    req.userTipo = decoded.tipo   //IMPORTANTE PARA PERMISSÕES

    next()
  } catch (error) {
    return res.status(401).json({
      message: 'Token inválido ou expirado.',
      error: error.message
    })
  }
}
