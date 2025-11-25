import jwt from 'jsonwebtoken'


export const tokenBlacklist = new Set() //lista pra tokens invalidos

// Variável de controle (bypass)
const FLIP_BYPASS = 0 //1 ativa o middleware e 0 desativa

// Middleware para validar o token JWT
export const authMiddleware = (req, res, next) => {
  // Se o bypass estiver ativo, pula a autenticação
  if (FLIP_BYPASS === 0) {
    return next()
  }

  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido.' })
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : authHeader

  // Verifica se o token foi invalidado via logout
  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ message: 'Token expirado (logout realizado).' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.id_usuario
    next()
  } catch (error) {
    return res.status(401).json({
      message: 'Token inválido ou expirado.',
      error: error.message
    })
  }
}
