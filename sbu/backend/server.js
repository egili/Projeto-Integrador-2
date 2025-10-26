const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { testConnection } = require('./database/connection');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requisições (útil para debug)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Servir arquivos estáticos para cada frontend
app.use('/aluno', express.static(path.join(__dirname, '../sistema-aluno')));
app.use('/bibliotecario', express.static(path.join(__dirname, '../sistema-bibliotecario')));
app.use('/totem', express.static(path.join(__dirname, '../totem')));

// Rota raiz da API - documentação
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'API do Sistema de Gestão de Biblioteca Universitária',
        version: '2.0',
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
                'POST /api/exemplares': 'Cadastrar novo exemplar',
                'GET /api/exemplares/codigo/:codigo': 'Buscar exemplar por código'
            },
            emprestimos: {
                'GET /api/emprestimos/pendentes': 'Listar empréstimos pendentes',
                'GET /api/emprestimos/historico': 'Listar histórico',
                'GET /api/emprestimos/aluno/:ra': 'Empréstimos de um aluno',
                'POST /api/emprestimos': 'Registrar empréstimo',
                'PUT /api/emprestimos/:id/devolver': 'Registrar devolução'
            },
            classificacao: {
                'GET /api/classificacao/geral': 'Ranking de leitores',
                'GET /api/classificacao/semestre/:id': 'Classificação por semestre',
                'GET /api/classificacao/aluno/:ra': 'Pontuação de um aluno',
                'GET /api/classificacao/semestres': 'Listar semestres'
            }
        }
    });
});

// Rotas da API
app.use('/api/alunos', require('./routes/alunos'));
app.use('/api/livros', require('./routes/livros'));
app.use('/api/exemplares', require('./routes/exemplares'));
app.use('/api/emprestimos', require('./routes/emprestimos'));
app.use('/api/classificacao', require('./routes/classificacao'));

// Rota raiz - redirecionar para sistema do aluno
app.get('/', (req, res) => {
    res.redirect('/aluno');
});

// Fallback para SPA - garantir que rotas frontend funcionem
app.get('/aluno/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../sistema-aluno/index.html'));
});

app.get('/bibliotecario/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../sistema-bibliotecario/index.html'));
});

app.get('/totem/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../totem/index.html'));
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        error: 'Rota não encontrada' 
    });
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
    console.error('Erro não tratado:', error);
    res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor' 
    });
});

// Testar conexão com o banco antes de iniciar o servidor
testConnection().then((connected) => {
    if (connected) {
        app.listen(PORT, () => {
            console.log('\n' + '='.repeat(60));
            console.log('🚀 Servidor iniciado com sucesso!');
            console.log('='.repeat(60));
            console.log(`📍 Porta: ${PORT}`);
            console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
            console.log('\n📱 Sistemas disponíveis:');
            console.log(`   👨‍🎓 Sistema do Aluno:        http://localhost:${PORT}/aluno`);
            console.log(`   📚 Sistema do Bibliotecário: http://localhost:${PORT}/bibliotecario`);
            console.log(`   🖥️  Totem:                   http://localhost:${PORT}/totem`);
            console.log('\n🔌 API:');
            console.log(`   http://localhost:${PORT}/api`);
            console.log('='.repeat(60) + '\n');
        });
    } else {
        console.error('❌ Não foi possível conectar ao banco de dados. Verifique as configurações.');
        process.exit(1);
    }
});

module.exports = app;