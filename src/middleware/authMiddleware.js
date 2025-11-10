// src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken'

// Variável de controle (bypass)
const FLIP_BYPASS = 0

// Middleware para validar o token JWT
export const authMiddleware = (req, res, next) => {
  // Se o bypass estiver ativo, pula a autenticação
  if (FLIP_BYPASS === 0) {
    return next()
  }

  // Espera que o token venha no cabeçalho: Authorization: Bearer <token>
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido.' })
  }

  // Pega apenas o token (remove a palavra "Bearer")
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : authHeader

  try {
    // Verifica se o token é válido usando a chave secreta do .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Salva o ID do usuário no request (para usar nas rotas, se precisar)
    req.userId = decoded.id_usuario

    // Continua a execução da rota
    next()
  } catch (error) {
    return res.status(401).json({
      message: 'Token inválido ou expirado.',
      error: error.message
    })
  }
}
