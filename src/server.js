// src/server.js
// RESPONSÁVEL: CT, Izidio
// SERVIDOR EXPRESS

import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import {categoriasRoutes, eventosRoutes, inscricoesRoutes, locaisRoutes, pagamentosRoutes, palestrasRoutes, usuarioRoutes} from './routes'
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

app.get('/', (req, res) => res.send('API rodando!'))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))
