// src/server.js
// RESPONSÁVEL: CT
// SERVIDOR EXPRESS

import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import usuarioRoutes from './routes/usuarioRoutes.js'
import './config/db.js' // importa apenas para inicializar pool

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())

//pra adicionar mais rotas faça o mesmo processo abaixo
app.use('/usuarios', usuarioRoutes)

app.get('/', (req, res) => res.send('API rodando!'))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))
