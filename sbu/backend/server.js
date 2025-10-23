const express = require('express');
const cors = require('cors');
const path = require('path');
const database = require('./database/connection');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos para cada frontend
app.use('/aluno', express.static(path.join(__dirname, '../sistema-aluno')));
app.use('/bibliotecario', express.static(path.join(__dirname, '../sistema-bibliotecario')));
app.use('/totem', express.static(path.join(__dirname, '../totem')));

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

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Sistema do Aluno: http://localhost:${PORT}/aluno`);
    console.log(`Sistema do Bibliotecário: http://localhost:${PORT}/bibliotecario`);
    console.log(`Totem: http://localhost:${PORT}/totem`);
    console.log(`API: http://localhost:${PORT}/api`);
});