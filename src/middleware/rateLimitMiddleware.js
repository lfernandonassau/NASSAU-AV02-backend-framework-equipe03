// src/middleware/rateLimitMiddleware.js
// Middleware simples e independente de Rate Limit (por IP/rota)
// RESPONSÁVEL: CT
const rateStore = new Map()

// Converte o intervalo para milissegundos
function parseInterval(amount, unit) {
  const u = unit.toLowerCase()

  if (u.startsWith('seg')) return amount * 1000
  if (u.startsWith('min')) return amount * 60 * 1000
  if (u.startsWith('hor')) return amount * 60 * 60 * 1000

  throw new Error(`Unidade de tempo inválida: ${unit}`)
}

// Middleware base
export function rateLimit(maxRequests, intervalUnit) {
  const windowMs = parseInterval(1, intervalUnit)

  return (req, res, next) => {
    const key = `${req.ip}_${req.originalUrl}`
    const currentTime = Date.now()

    // Se não existir chave, cria
    if (!rateStore.has(key)) {
      rateStore.set(key, {
        count: 1,
        startTime: currentTime
      })
      return next()
    }

    const entry = rateStore.get(key)

    // Verifica se a janela expirou
    if (currentTime - entry.startTime > windowMs) {
      entry.count = 1
      entry.startTime = currentTime
      return next()
    }

    // Verifica limite
    if (entry.count >= maxRequests) {
      return res.status(429).json({
        message: `Limite de ${maxRequests} requisição(ões) por ${intervalUnit} para esta rota.`,
        retry_after: Math.ceil((entry.startTime + windowMs - currentTime) / 1000) + 's'
      })
    }

    // Incrementa
    entry.count++
    next()
  }
}
