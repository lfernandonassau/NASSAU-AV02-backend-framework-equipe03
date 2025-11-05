// src/config/db.js
// RESPONSÁVEL: CT
// CONEXÃO COM POSTGRESQL (SUPABASE)

import pkg from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const { Pool } = pkg

const MAX_RETRIES = 5
const RETRY_DELAY = 5000

let pool

function createPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    })

    pool.on('error', async (err) => {
      // códigos normais do Supabase Pooler
      const normalPoolErrors = ['57P01', 'ECONNRESET', 'client_termination', ':shutdown', ':db_termination']
      if (
        err.code && normalPoolErrors.includes(err.code) ||
        err.message && normalPoolErrors.some(e => err.message.includes(e))
      ) {
        console.warn('conexao finalizada pelo pooler, reconectando...')
        await reconnectPool()
        return
      }

      // só loga erros realmente inesperados
      console.error('erro inesperado no pool:', err.message)
    })
  }
  return pool
}

async function reconnectPool(retryCount = 0) {
  try {
    if (pool) await pool.end()
    pool = null
    createPool()
    const client = await pool.connect()
    client.release()
    console.log('conectado ao banco supabase')
  } catch (err) {
    console.error(`erro ao reconectar (${retryCount + 1}/${MAX_RETRIES}):`, err.message)
    if (retryCount < MAX_RETRIES) {
      setTimeout(() => reconnectPool(retryCount + 1), RETRY_DELAY)
    } else {
      console.error('falha ao reconectar, encerrando')
      process.exit(1)
    }
  }
}

// inicializa o pool uma vez ao importar
createPool()

export { pool }
