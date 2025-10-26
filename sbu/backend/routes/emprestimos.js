const express = require('express');
const router = express.Router();
const { connection } = require('../database/connection');

// Listar empréstimos pendentes (todos)
router.get('/pendentes', async (req, res) => {
    try {
        const [rows] = await connection.execute(`
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
            ORDER BY e.dataEmprestimo DESC
        `);
        
        res.json({ 
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Erro ao listar empréstimos pendentes:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor ao listar empréstimos pendentes' 
        });
    }
});

// Listar histórico completo de empréstimos
router.get('/historico', async (req, res) => {
    try {
        const [rows] = await connection.execute(`
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
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor ao listar histórico' 
        });
    }
});

// Listar empréstimos ativos por aluno (RA)
router.get('/aluno/:ra', async (req, res) => {
    try {
        const { ra } = req.params;
        
        const [rows] = await connection.execute(`
            SELECT e.*, 
                   l.titulo,
                   l.autor,
                   ex.codigo as codigo_exemplar
            FROM emprestimo e
            JOIN aluno a ON e.idAluno = a.id
            JOIN exemplar ex ON e.idExemplar = ex.id
            JOIN livro l ON ex.idLivro = l.id
            WHERE a.ra = ? AND e.dataDevolucaoReal IS NULL
            ORDER BY e.dataEmprestimo DESC
        `, [ra]);
        
        res.json({ 
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Erro ao listar empréstimos do aluno:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor ao listar empréstimos' 
        });
    }
});

// Registrar empréstimo
router.post('/', async (req, res) => {
    const conn = await connection.getConnection();
    try {
        const { ra, codigoExemplar } = req.body;
        
        if (!ra || !codigoExemplar) {
            return res.status(400).json({ 
                success: false,
                error: 'RA do aluno e código do exemplar são obrigatórios' 
            });
        }

        await conn.beginTransaction();

        // Buscar aluno
        const [aluno] = await conn.execute(
            'SELECT * FROM aluno WHERE ra = ?',
            [ra]
        );

        if (aluno.length === 0) {
            await conn.rollback();
            return res.status(404).json({ 
                success: false,
                error: 'Aluno não encontrado' 
            });
        }

        // Buscar exemplar
        const [exemplar] = await conn.execute(
            'SELECT * FROM exemplar WHERE codigo = ?',
            [codigoExemplar]
        );

        if (exemplar.length === 0) {
            await conn.rollback();
            return res.status(404).json({ 
                success: false,
                error: 'Exemplar não encontrado' 
            });
        }

        if (exemplar[0].status !== 'disponivel') {
            await conn.rollback();
            return res.status(400).json({ 
                success: false,
                error: 'Exemplar não está disponível para empréstimo' 
            });
        }

        // Calcular data de empréstimo
        const dataEmprestimo = new Date().toISOString().split('T')[0];

        // Registrar empréstimo
        const [result] = await conn.execute(
            'INSERT INTO emprestimo (idAluno, idExemplar, dataEmprestimo) VALUES (?, ?, ?)',
            [aluno[0].id, exemplar[0].id, dataEmprestimo]
        );

        // Atualizar status do exemplar
        await conn.execute(
            'UPDATE exemplar SET status = "emprestado" WHERE id = ?',
            [exemplar[0].id]
        );

        await conn.commit();

        res.status(201).json({ 
            success: true,
            message: 'Empréstimo registrado com sucesso',
            data: {
                id: result.insertId,
                aluno: aluno[0].nome,
                ra: aluno[0].ra,
                codigoExemplar: exemplar[0].codigo,
                dataEmprestimo
            }
        });

    } catch (error) {
        await conn.rollback();
        console.error('Erro ao registrar empréstimo:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor ao registrar empréstimo' 
        });
    } finally {
        conn.release();
    }
});

// Registrar devolução
router.put('/:id/devolver', async (req, res) => {
    const conn = await connection.getConnection();
    try {
        const { id } = req.params;
        
        await conn.beginTransaction();

        // Buscar o empréstimo
        const [emprestimo] = await conn.execute(
            'SELECT * FROM emprestimo WHERE id = ?',
            [id]
        );

        if (emprestimo.length === 0) {
            await conn.rollback();
            return res.status(404).json({ 
                success: false,
                error: 'Empréstimo não encontrado' 
            });
        }

        if (emprestimo[0].dataDevolucaoReal) {
            await conn.rollback();
            return res.status(400).json({ 
                success: false,
                error: 'Este empréstimo já foi devolvido' 
            });
        }

        const dataDevolucaoReal = new Date().toISOString().split('T')[0];

        // Atualizar empréstimo
        await conn.execute(
            'UPDATE emprestimo SET dataDevolucaoReal = ? WHERE id = ?',
            [dataDevolucaoReal, id]
        );

        // Atualizar status do exemplar
        await conn.execute(
            'UPDATE exemplar SET status = "disponivel" WHERE id = ?',
            [emprestimo[0].idExemplar]
        );

        await conn.commit();

        res.json({ 
            success: true,
            message: 'Devolução registrada com sucesso',
            data: {
                id,
                dataDevolucaoReal
            }
        });

    } catch (error) {
        await conn.rollback();
        console.error('Erro ao registrar devolução:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor ao registrar devolução' 
        });
    } finally {
        conn.release();
    }
});

module.exports = router;

