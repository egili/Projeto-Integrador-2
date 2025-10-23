const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { testConnection } = require('./database/connection');
const { logRequest } = require('./middleware/logging');

// Import controllers
const alunoController = require('./controllers/alunoController');
const livroController = require('./controllers/livroController');
const emprestimoController = require('./controllers/emprestimoController');
const classificacaoController = require('./controllers/classificacaoController');
const exemplarController = require('./controllers/exemplarController');
const logController = require('./controllers/logController');

const app = express();
const PORT = 9999;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logRequest);

// Testar conexão com banco
testConnection();

// Routes - Alunos
app.post('/api/alunos', alunoController.cadastrarAluno);
app.get('/api/alunos', alunoController.listarAlunos);
app.get('/api/alunos/:ra', alunoController.buscarAlunoPorRa);

// Routes - Livros
app.post('/api/livros', livroController.cadastrarLivro);
app.get('/api/livros/disponiveis', livroController.listarLivrosDisponiveis);
app.get('/api/livros', livroController.buscarLivros);
app.get('/api/livros/todos', livroController.listarTodosLivros);
app.get('/api/livros/com-exemplares', livroController.listarLivrosComExemplares);
app.get('/api/livros/disponiveis-com-exemplares', livroController.listarLivrosDisponiveisComExemplares);
app.get('/api/livros/:id', livroController.buscarLivroPorId);

// Routes - Empréstimos
app.post('/api/emprestimos', emprestimoController.realizarEmprestimo);
app.post('/api/emprestimos/codigo', emprestimoController.realizarEmprestimoPorCodigo);
app.post('/api/emprestimos/devolucao', emprestimoController.registrarDevolucao);
app.get('/api/emprestimos/ativos/:ra', emprestimoController.listarEmprestimosAtivosPorAluno);
app.get('/api/emprestimos/ativos', emprestimoController.listarTodosEmprestimosAtivos);

// Routes - Exemplares
app.post('/api/exemplares', exemplarController.cadastrarExemplar);
app.get('/api/exemplares', exemplarController.listarExemplares);
app.get('/api/exemplares/disponiveis', exemplarController.listarExemplaresDisponiveis);
app.get('/api/exemplares/:id', exemplarController.buscarExemplarPorId);
app.get('/api/exemplares/codigo/:codigo', exemplarController.buscarExemplarPorCodigo);
app.put('/api/exemplares/:id', exemplarController.atualizarExemplar);
app.put('/api/exemplares/:id/status', exemplarController.atualizarStatusExemplar);
app.delete('/api/exemplares/:id', exemplarController.excluirExemplar);

// Routes - Classificação
app.get('/api/classificacao/:ra', classificacaoController.obterClassificacaoPorAluno);
app.get('/api/classificacao', classificacaoController.listarClassificacaoGeral);

// Routes - Logs
app.get('/api/logs', logController.listarLogs);
app.get('/api/logs/tipo/:tipo', logController.listarLogsPorTipo);
app.get('/api/logs/recentes', logController.listarLogsRecentes);
app.get('/api/logs/estatisticas', logController.obterEstatisticasLogs);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API do Sistema de Biblioteca Universitária está funcionando!',
        timestamp: new Date().toISOString()
    });
});

// Rota padrão
app.get('/', (req, res) => {
    res.json({
        message: 'Bem-vindo ao Sistema de Biblioteca Universitária',
        version: '1.0.0',
        endpoints: {
            alunos: '/api/alunos',
            livros: '/api/livros',
            exemplares: '/api/exemplares',
            emprestimos: '/api/emprestimos',
            classificacao: '/api/classificacao',
            logs: '/api/logs'
        }
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Erro não tratado:', error);
    res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint não encontrado'
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Sistema de Biblioteca Universitária`);
    console.log(`Acesse: http://localhost:${PORT}`);
});

module.exports = app;