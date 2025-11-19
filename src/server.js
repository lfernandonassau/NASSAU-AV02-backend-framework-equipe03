// src/server.js
// RESPONSÁVEL: CT, Izidio
// SERVIDOR EXPRESS

import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import categoriasRoutes from './routes/categoriasRoutes.js'
import eventosRoutes from './routes/eventosRoutes.js'
import inscricoesRoutes from './routes/inscricoesRoutes.js'
import locaisRoutes from './routes/locaisRoutes.js'
import pagamentosRoutes from './routes/pagamentosRoutes.js'
import palestrasRoutes from './routes/palestrasRoutes.js'
import usuarioRoutes from './routes/usuarioRoutes.js'
import loginRoutes from './routes/loginRoutes.js'
import './config/db.js' // importa apenas para inicializar pool

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())

//Todas as rotas declaradas
app.use('/categorias', categoriasRoutes)
app.use('/eventos', eventosRoutes)
app.use('/inscricoes', inscricoesRoutes)
app.use('/locais', locaisRoutes)
app.use('/pagamentos', pagamentosRoutes)
app.use('/palestras', palestrasRoutes)
app.use('/usuarios', usuarioRoutes)
app.use('/auth', loginRoutes)

app.get('/', (req, res) => res.send('Organize seu evento conosco!'))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  const host = process.env.HOST || 'localhost'
  console.log(`Servidor rodando em http://${host}:${PORT}`)
})
