const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuração do pool de conexões MySQL
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'biblioteca',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Testar conexão com o banco
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conectado ao banco de dados MySQL');
        connection.release();
    } catch (error) {
        console.error('❌ Erro ao conectar com o banco:', error.message);
    }
}

testConnection();

// Rotas para Livros

// Cadastrar livro
app.post('/api/livros', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { titulo, isbn, autor, editora, anoPublicacao, categoria, numeroExemplares } = req.body;
        
        // Validação básica
        if (!titulo || !autor || !editora || !anoPublicacao || !categoria || numeroExemplares === undefined) {
            return res.status(400).json({ 
                error: 'Todos os campos são obrigatórios, exceto ISBN' 
            });
        }

        await connection.beginTransaction();

        // Inserir o livro
        const [resultLivro] = await connection.execute(
            'INSERT INTO livro (titulo, isbn, autor, editora, anoPublicacao) VALUES (?, ?, ?, ?, ?)',
            [titulo, isbn || null, autor, editora, anoPublicacao]
        );

        const idLivro = resultLivro.insertId;

        // Inserir exemplares
        const exemplares = [];
        for (let i = 1; i <= numeroExemplares; i++) {
            const codigo = `EX-${String(idLivro).padStart(3, '0')}-${String(i).padStart(2, '0')}`;
            exemplares.push([idLivro, codigo, 'disponivel', null]);
        }

        if (exemplares.length > 0) {
            await connection.execute(
                'INSERT INTO exemplar (idLivro, codigo, status, observacoes) VALUES ?',
                [exemplares]
            );
        }

        await connection.commit();

        // Registrar no log
        await pool.execute(
            'INSERT INTO log (tipo, descricao) VALUES (?, ?)',
            ['sucesso', `Livro ${titulo} cadastrado com ${numeroExemplares} exemplares`]
        );

        res.status(201).json({ 
            success: true,
            message: 'Livro e exemplares cadastrados com sucesso',
            id: idLivro
        });

    } catch (error) {
        await connection.rollback();
        console.error('Erro ao cadastrar livro:', error);
        
        // Registrar erro no log
        await pool.execute(
            'INSERT INTO log (tipo, descricao) VALUES (?, ?)',
            ['erro', `Erro ao cadastrar livro: ${error.message}`]
        );
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ 
                error: 'ISBN já cadastrado' 
            });
        }
        
        res.status(500).json({ 
            error: 'Erro interno do servidor ao cadastrar livro' 
        });
    } finally {
        connection.release();
    }
});

// Listar todos os livros com contagem de exemplares
app.get('/api/livros', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT l.*, 
                   COUNT(e.id) as total_exemplares,
                   SUM(CASE WHEN e.status = 'disponivel' THEN 1 ELSE 0 END) as exemplares_disponiveis
            FROM livro l
            LEFT JOIN exemplar e ON l.id = e.idLivro
            GROUP BY l.id
            ORDER BY l.titulo
        `);
        
        res.json({ 
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Erro ao listar livros:', error);
        
        await pool.execute(
            'INSERT INTO log (tipo, descricao) VALUES (?, ?)',
            ['erro', `Erro ao listar livros: ${error.message}`]
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor ao listar livros' 
        });
    }
});

// Buscar livros por termo (título, autor, editora ou ISBN)
app.get('/api/livros/busca/:termo', async (req, res) => {
    try {
        const { termo } = req.params;
        const searchTerm = `%${termo}%`;
        
        const [rows] = await pool.execute(`
            SELECT l.*, 
                   COUNT(e.id) as total_exemplares,
                   SUM(CASE WHEN e.status = 'disponivel' THEN 1 ELSE 0 END) as exemplares_disponiveis
            FROM livro l
            LEFT JOIN exemplar e ON l.id = e.idLivro
            WHERE l.titulo LIKE ? OR l.autor LIKE ? OR l.editora LIKE ? OR l.isbn LIKE ?
            GROUP BY l.id
            ORDER BY l.titulo
        `, [searchTerm, searchTerm, searchTerm, searchTerm]);
        
        res.json({ 
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Erro ao buscar livros:', error);
        
        await pool.execute(
            'INSERT INTO log (tipo, descricao) VALUES (?, ?)',
            ['erro', `Erro ao buscar livros por termo ${termo}: ${error.message}`]
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor ao buscar livros' 
        });
    }
});

// Listar exemplares por livro
app.get('/api/exemplares/livro/:idLivro', async (req, res) => {
    try {
        const { idLivro } = req.params;
        
        const [rows] = await pool.execute(`
            SELECT e.*, l.titulo, l.autor
            FROM exemplar e
            JOIN livro l ON e.idLivro = l.id
            WHERE e.idLivro = ?
            ORDER BY e.status, e.codigo
        `, [idLivro]);
        
        res.json({ 
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Erro ao listar exemplares:', error);
        
        await pool.execute(
            'INSERT INTO log (tipo, descricao) VALUES (?, ?)',
            ['erro', `Erro ao listar exemplares do livro ${idLivro}: ${error.message}`]
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor ao listar exemplares' 
        });
    }
});

// Cadastrar exemplar
app.post('/api/exemplares', async (req, res) => {
    try {
        const { idLivro, codigo, observacoes } = req.body;
        
        if (!idLivro || !codigo) {
            return res.status(400).json({ 
                error: 'ID do livro e código são obrigatórios' 
            });
        }

        const [result] = await pool.execute(
            'INSERT INTO exemplar (idLivro, codigo, status, observacoes) VALUES (?, ?, "disponivel", ?)',
            [idLivro, codigo, observacoes || null]
        );

        await pool.execute(
            'INSERT INTO log (tipo, descricao) VALUES (?, ?)',
            ['sucesso', `Exemplar ${codigo} cadastrado para livro ${idLivro}`]
        );

        res.status(201).json({ 
            success: true,
            message: 'Exemplar cadastrado com sucesso',
            id: result.insertId
        });

    } catch (error) {
        console.error('Erro ao cadastrar exemplar:', error);
        
        await pool.execute(
            'INSERT INTO log (tipo, descricao) VALUES (?, ?)',
            ['erro', `Erro ao cadastrar exemplar: ${error.message}`]
        );
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ 
                error: 'Código do exemplar já cadastrado' 
            });
        }
        
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor ao cadastrar exemplar' 
        });
    }
});

// Rotas para Empréstimos

// Listar empréstimos pendentes
app.get('/api/emprestimos/pendentes', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT e.*, 
                   a.nome as aluno_nome, 
                   a.ra,
                   l.titulo,
                   ex.codigo as codigo_exemplar
            FROM emprestimo e
            JOIN aluno a ON e.idAluno = a.id
            JOIN exemplar ex ON e.idExemplar = ex.id
            JOIN livro l ON ex.idLivro = l.id
            WHERE e.dataDevolucaoReal IS NULL
            ORDER BY e.dataDevolucaoPrevista ASC
        `);
        
        res.json({ 
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Erro ao listar empréstimos pendentes:', error);
        
        await pool.execute(
            'INSERT INTO log (tipo, descricao) VALUES (?, ?)',
            ['erro', `Erro ao listar empréstimos pendentes: ${error.message}`]
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor ao listar empréstimos pendentes' 
        });
    }
});

// Listar histórico completo de empréstimos
app.get('/api/emprestimos/historico', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT e.*, 
                   a.nome as aluno_nome, 
                   a.ra,
                   l.titulo,
                   ex.codigo as codigo_exemplar
            FROM emprestimo e
            JOIN aluno a ON e.idAluno = a.id
            JOIN exemplar ex ON e.idExemplar = ex.id
            JOIN livro l ON ex.idLivro = l.id
            ORDER BY e.dataEmprestimo DESC
        `);
        
        res.json({ 
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Erro ao listar histórico de empréstimos:', error);
        
        await pool.execute(
            'INSERT INTO log (tipo, descricao) VALUES (?, ?)',
            ['erro', `Erro ao listar histórico de empréstimos: ${error.message}`]
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor ao listar histórico' 
        });
    }
});

// Registrar empréstimo
app.post('/api/emprestimos', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { idAluno, idExemplar, dataEmprestimo, dataDevolucaoPrevista } = req.body;
        
        if (!idAluno || !idExemplar || !dataEmprestimo || !dataDevolucaoPrevista) {
            return res.status(400).json({ 
                error: 'Todos os campos são obrigatórios' 
            });
        }

        // Verificar se o exemplar está disponível
        const [exemplar] = await connection.execute(
            'SELECT status FROM exemplar WHERE id = ?',
            [idExemplar]
        );

        if (exemplar.length === 0) {
            return res.status(404).json({ error: 'Exemplar não encontrado' });
        }

        if (exemplar[0].status !== 'disponivel') {
            return res.status(400).json({ error: 'Exemplar não está disponível para empréstimo' });
        }

        await connection.beginTransaction();

        // Registrar empréstimo
        const [result] = await connection.execute(
            'INSERT INTO emprestimo (idAluno, idExemplar, dataEmprestimo, dataDevolucaoPrevista) VALUES (?, ?, ?, ?)',
            [idAluno, idExemplar, dataEmprestimo, dataDevolucaoPrevista]
        );

        // Atualizar status do exemplar
        await connection.execute(
            'UPDATE exemplar SET status = "emprestado" WHERE id = ?',
            [idExemplar]
        );

        await connection.commit();
        
        await pool.execute(
            'INSERT INTO log (tipo, descricao) VALUES (?, ?)',
            ['sucesso', `Empréstimo registrado: aluno ${idAluno}, exemplar ${idExemplar}`]
        );

        res.status(201).json({ 
            success: true,
            message: 'Empréstimo registrado com sucesso',
            id: result.insertId 
        });

    } catch (error) {
        await connection.rollback();
        console.error('Erro ao registrar empréstimo:', error);
        
        await pool.execute(
            'INSERT INTO log (tipo, descricao) VALUES (?, ?)',
            ['erro', `Erro ao registrar empréstimo: ${error.message}`]
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor ao registrar empréstimo' 
        });
    } finally {
        connection.release();
    }
});

// Registrar devolução
app.put('/api/emprestimos/:id/devolver', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        const { dataDevolucaoReal } = req.body;
        
        if (!dataDevolucaoReal) {
            return res.status(400).json({ 
                error: 'Data de devolução é obrigatória' 
            });
        }

        await connection.beginTransaction();

        // Buscar o empréstimo para obter o idExemplar
        const [emprestimo] = await connection.execute(
            'SELECT idExemplar FROM emprestimo WHERE id = ?',
            [id]
        );

        if (emprestimo.length === 0) {
            return res.status(404).json({ error: 'Empréstimo não encontrado' });
        }

        const idExemplar = emprestimo[0].idExemplar;

        // Atualizar empréstimo
        await connection.execute(
            'UPDATE emprestimo SET dataDevolucaoReal = ? WHERE id = ?',
            [dataDevolucaoReal, id]
        );

        // Atualizar status do exemplar
        await connection.execute(
            'UPDATE exemplar SET status = "disponivel" WHERE id = ?',
            [idExemplar]
        );

        await connection.commit();
        
        await pool.execute(
            'INSERT INTO log (tipo, descricao) VALUES (?, ?)',
            ['sucesso', `Devolução registrada para empréstimo ${id}`]
        );

        res.json({ 
            success: true,
            message: 'Devolução registrada com sucesso'
        });

    } catch (error) {
        await connection.rollback();
        console.error('Erro ao registrar devolução:', error);
        
        await pool.execute(
            'INSERT INTO log (tipo, descricao) VALUES (?, ?)',
            ['erro', `Erro ao registrar devolução: ${error.message}`]
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor ao registrar devolução' 
        });
    } finally {
        connection.release();
    }
});

// Rotas para Classificação

// Obter classificação geral
app.get('/api/classificacao/geral', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT a.nome, a.ra, 
                   COUNT(e.id) as total_livros_emprestados
            FROM aluno a
            LEFT JOIN emprestimo e ON a.id = e.idAluno
            GROUP BY a.id
            ORDER BY total_livros_emprestados DESC, a.nome
        `);
        
        res.json({ 
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Erro ao obter classificação geral:', error);
        
        await pool.execute(
            'INSERT INTO log (tipo, descricao) VALUES (?, ?)',
            ['erro', `Erro ao obter classificação geral: ${error.message}`]
        );
        
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor ao obter classificação geral' 
        });
    }
});

// Rota para servir a página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
    res.status(404).json({ success: false, error: 'Rota não encontrada' });
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
    console.error('Erro não tratado:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
});

// Inicializar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📚 Acesse: http://localhost:${PORT}`);
});

module.exports = app;