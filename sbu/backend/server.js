require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connection } = require('./database/connection');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de log de requisições
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Servir arquivos estáticos dos frontends
app.use('/aluno', express.static(path.join(__dirname, '../sistema-aluno')));
app.use('/bibliotecario', express.static(path.join(__dirname, '../sistema-bibliotecario')));
app.use('/totem', express.static(path.join(__dirname, '../totem')));

// Rotas da API
const alunosRoutes = require('./routes/alunos');
const livrosRoutes = require('./routes/livros');
const emprestimosRoutes = require('./routes/emprestimos');
const exemplaresRoutes = require('./routes/exemplares');

// Rota raiz da API - documentação
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

// Usar as rotas
app.use('/api/alunos', alunosRoutes);
app.use('/api/livros', livrosRoutes);
app.use('/api/emprestimos', emprestimosRoutes);
app.use('/api/exemplares', exemplaresRoutes);

// Rota 404 para APIs
app.use('/api/*', (req, res) => {
    res.status(404).json({ 
        success: false,
        error: 'Rota não encontrada' 
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor' 
    });
});

// Função para encontrar uma porta disponível
function findAvailablePort(startPort, maxAttempts = 10) {
    return new Promise((resolve, reject) => {
        const net = require('net');
        let attempts = 0;

        function tryPort(port) {
            const server = net.createServer();
            
            server.listen(port, () => {
                server.once('close', () => resolve(port));
                server.close();
            });

            server.on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    attempts++;
                    if (attempts >= maxAttempts) {
                        reject(new Error(`Não foi possível encontrar uma porta disponível após ${maxAttempts} tentativas`));
                    } else {
                        tryPort(port + 1);
                    }
                } else {
                    reject(err);
                }
            });
        }

        tryPort(startPort);
    });
}

// Iniciar servidor
async function startServer() {
    try {
        // Testar conexão com o banco
        await connection.query('SELECT 1');
        console.log('Conectado ao MySQL com sucesso!');
        
        // Tentar usar a porta especificada ou encontrar uma alternativa
        let portToUse = PORT;
        
        try {
            // Verificar se a porta está disponível
            await findAvailablePort(PORT, 1);
        } catch (error) {
            console.warn(`Porta ${PORT} está em uso. Tentando encontrar uma porta alternativa...`);
            try {
                portToUse = await findAvailablePort(PORT + 1, 10);
                console.log(`Usando porta alternativa: ${portToUse}`);
            } catch (altError) {
                console.error('Erro ao encontrar porta disponível:', altError.message);
                console.error('\nSoluções possíveis:');
                console.error('   1. Encerre o processo que está usando a porta 3000');
                console.error('   2. Use uma porta diferente definindo PORT no arquivo .env');
                console.error('   3. No Windows, execute: netstat -ano | findstr :3000');
                console.error('   4. No Linux/Mac, execute: lsof -i :3000');
                process.exit(1);
            }
        }

        const server = app.listen(portToUse, () => {
            console.log('============================================================');
            console.log('Servidor iniciado com sucesso!');
            console.log('============================================================');
            console.log(`Porta: ${portToUse}`);
            console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
            console.log('Sistemas disponíveis:');
            console.log(`   Sistema do Aluno:        http://localhost:${portToUse}/aluno`);
            console.log(`   Sistema do Bibliotecário: http://localhost:${portToUse}/bibliotecario`);
            console.log(`   Totem:                   http://localhost:${portToUse}/totem`);
            console.log('API:');
            console.log(`   http://localhost:${portToUse}/api`);
            console.log('============================================================');
        });

        // Tratar erros do servidor
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`\nErro: A porta ${portToUse} já está em uso!`);
                console.error('\nSoluções possíveis:');
                console.error('   1. Encerre o processo que está usando a porta');
                console.error('   2. Use uma porta diferente definindo PORT no arquivo .env');
                console.error('   3. No Windows, execute: netstat -ano | findstr :3000');
                console.error('   4. No Linux/Mac, execute: lsof -i :3000');
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
