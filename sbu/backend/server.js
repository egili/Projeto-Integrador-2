require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const net = require('net');
const { connection } = require('./database/connection');

const app = express();
const PORT = parseInt(process.env.PORT) || 3000;

/* ============================================================
   MIDDLEWARES
============================================================ */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requisições
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

/* ============================================================
   FRONT-ENDS ESTÁTICOS
============================================================ */
app.use('/aluno', express.static(path.join(__dirname, '../sistema-aluno')));
app.use('/bibliotecario', express.static(path.join(__dirname, '../sistema-bibliotecario')));
app.use('/totem', express.static(path.join(__dirname, '../totem')));

/* ============================================================
   ROTAS DA API
============================================================ */
const alunosRoutes = require('./routes/alunos');
const livrosRoutes = require('./routes/livros');
const emprestimosRoutes = require('./routes/emprestimos');
const exemplaresRoutes = require('./routes/exemplares');
const classificacaoRoutes = require('./routes/classificacao');


app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'API do Sistema de Gestão de Biblioteca Universitária',
        version: '3.0',
        endpoints: {
            alunos: {
                'GET /api/alunos': 'Listar todos os alunos',
                'POST /api/alunos': 'Cadastrar novo aluno',
                'GET /api/alunos/ra/:ra': 'Buscar aluno por RA'
            },
            livros: {
                'GET /api/livros': 'Listar todos os livros',
                'POST /api/livros': 'Cadastrar novo livro',
                'GET /api/livros/disponiveis': 'Listar livros disponíveis',
                'GET /api/livros/busca?titulo=X': 'Buscar livros',
                'GET /api/livros/:id': 'Buscar livro por ID'
            },
            exemplares: {
                'GET /api/exemplares/livro/:idLivro': 'Listar exemplares de um livro',
                'POST /api/exemplares': 'Cadastrar novo exemplar'
            },
            emprestimos: {
                'GET /api/emprestimos/aluno/:ra': 'Empréstimos de um aluno',
                'POST /api/emprestimos': 'Registrar empréstimo',
                'PUT /api/emprestimos/:id/devolver': 'Registrar devolução'
            }
        }
    });
});

app.use('/api/alunos', alunosRoutes);
app.use('/api/livros', livrosRoutes);
app.use('/api/emprestimos', emprestimosRoutes);
app.use('/api/exemplares', exemplaresRoutes);
app.use('/api/classificacao', classificacaoRoutes);


/* ============================================================
   ROTA 404 PARA API
============================================================ */
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Rota não encontrada'
    });
});

/* ============================================================
   ERROS GLOBAIS
============================================================ */
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
    });
});

/* ============================================================
   FUNÇÃO PARA ACHAR PORTA LIVRE
============================================================ */
function findAvailablePort(startPort, maxAttempts = 10) {
    return new Promise((resolve, reject) => {
        let attempts = 0;

        const tryPort = (port) => {
            const server = net.createServer();

            server.listen(port, () => {
                server.close(() => resolve(port));
            });

            server.on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    attempts++;
                    if (attempts >= maxAttempts) {
                        reject(new Error(`Nenhuma porta disponível após ${maxAttempts} tentativas`));
                    } else {
                        tryPort(port + 1);
                    }
                } else {
                    reject(err);
                }
            });
        };

        tryPort(startPort);
    });
}

/* ============================================================
   INICIAR SERVIDOR
============================================================ */
async function startServer() {
    try {
        await connection.query('SELECT 1');
        console.log('Conectado ao MySQL com sucesso!');

        let portToUse = PORT;

        try {
            await findAvailablePort(PORT, 1);
        } catch {
            console.warn(`Porta ${PORT} em uso. Buscando porta alternativa...`);
            portToUse = await findAvailablePort(PORT + 1, 10);
            console.log(`Usando porta alternativa: ${portToUse}`);
        }

        const server = app.listen(portToUse, () => {
            console.log('============================================================');
            console.log('Servidor iniciado com sucesso!');
            console.log('============================================================');
            console.log(`Porta: ${portToUse}`);
            console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
            console.log('Sistemas disponíveis:');
            console.log(`   Sistema do Aluno:         http://localhost:${portToUse}/aluno`);
            console.log(`   Sistema do Bibliotecário: http://localhost:${portToUse}/bibliotecario`);
            console.log(`   Totem:                    http://localhost:${portToUse}/totem`);
            console.log('API:');
            console.log(`   http://localhost:${portToUse}/api`);
            console.log('============================================================');
        });

        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`Erro: Porta ${portToUse} em uso!`);
                process.exit(1);
            } else {
                console.error('Erro ao iniciar servidor:', error);
                process.exit(1);
            }
        });

    } catch (error) {
        console.error('Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app;
