const express = require('express');
const router = express.Router();
const { connection } = require('../database/connection');

/* ================================================
   LISTAR EMPRÉSTIMOS PENDENTES
================================================ */
router.get('/pendentes', async (req, res) => {
    try {
        const [rows] = await connection.execute(`
            SELECT 
                e.id,
                l.titulo AS livro,
                a.nome AS aluno,
                DATE_FORMAT(e.dataEmprestimo, '%Y-%m-%dT%H:%i:%s') AS data, 
                ex.id AS id_exemplar
            FROM emprestimo e
            INNER JOIN aluno a ON e.idAluno = a.id
            INNER JOIN exemplar ex ON e.idExemplar = ex.id
            INNER JOIN livro l ON ex.idLivro = l.id
            WHERE e.dataDevolucaoReal IS NULL
            ORDER BY e.dataEmprestimo DESC
        `);

        console.log('Pendentes carregados via rota:', rows.length, 'registros');
        res.json({ success: true, data: rows });

    } catch (error) {
        console.error("Erro ao carregar pendentes:", error);
        res.status(500).json({ success: false, error: "Erro interno do servidor" });
    }
});

/* ================================================
   LISTAR HISTÓRICO DE EMPRÉSTIMOS
================================================ */
router.get('/historico', async (req, res) => {
    try {
        const [rows] = await connection.execute(`
            SELECT 
                e.id,
                l.titulo AS livro,
                a.nome AS aluno,
                DATE_FORMAT(e.dataEmprestimo, '%Y-%m-%d %H:%i:%s') AS data_emprestimo,
                DATE_FORMAT(e.dataDevolucaoReal, '%Y-%m-%d %H:%i:%s') AS data_devolucao,
                ex.id AS id_exemplar
            FROM emprestimo e
            INNER JOIN aluno a ON e.idAluno = a.id
            INNER JOIN exemplar ex ON e.idExemplar = ex.id
            INNER JOIN livro l ON ex.idLivro = l.id
            WHERE e.dataDevolucaoReal IS NOT NULL
            ORDER BY e.dataEmprestimo DESC
        `);

        console.log('Histórico carregado via rota:', rows.length, 'registros');
        res.json({ success: true, data: rows });

    } catch (error) {
        console.error("Erro ao carregar histórico:", error);
        res.status(500).json({ success: false, error: "Erro interno do servidor" });
    }
});

/* ================================================
   REALIZAR EMPRÉSTIMO
================================================ */
router.post('/', async (req, res) => {
    try {
        const { idAluno, idExemplar } = req.body;

        if (!idAluno || !idExemplar) {
            return res.status(400).json({
                success: false,
                error: 'ID do aluno e ID do exemplar são obrigatórios'
            });
        }

        // Verificar disponibilidade do exemplar
        const [exemplar] = await connection.execute(
            'SELECT * FROM exemplar WHERE id = ? AND status = "disponivel"',
            [idExemplar]
        );

        if (exemplar.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Exemplar não disponível'
            });
        }

        // Registrar empréstimo
        const [result] = await connection.execute(
            'INSERT INTO emprestimo (idAluno, idExemplar, dataEmprestimo) VALUES (?, ?, NOW())',
            [idAluno, idExemplar]
        );

        // Marcar exemplar como emprestado
        await connection.execute(
            'UPDATE exemplar SET status = "emprestado" WHERE id = ?',
            [idExemplar]
        );

        res.status(201).json({
            success: true,
            message: 'Empréstimo realizado com sucesso',
            data: { id: result.insertId }
        });

    } catch (error) {
        console.error('Erro ao realizar empréstimo:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/* ================================================
   DEVOLVER UM LIVRO
================================================ */
router.put('/:id/devolver', async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar empréstimo ativo
        const [emprestimo] = await connection.execute(
            'SELECT * FROM emprestimo WHERE id = ? AND dataDevolucaoReal IS NULL',
            [id]
        );

        if (emprestimo.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Empréstimo não encontrado ou já devolvido'
            });
        }

        // Registrar devolução
        await connection.execute(
            'UPDATE emprestimo SET dataDevolucaoReal = NOW() WHERE id = ?',
            [id]
        );

        // Liberar exemplar
        await connection.execute(
            'UPDATE exemplar SET status = "disponivel" WHERE id = ?',
            [emprestimo[0].idExemplar]
        );

        res.json({
            success: true,
            message: 'Devolução realizada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao realizar devolução:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

/* ================================================
   LISTAR EMPRÉSTIMOS ATIVOS POR RA DE ALUNO
================================================ */
router.get('/aluno/:ra', async (req, res) => {
    try {
        const { ra } = req.params;

        // Buscar aluno
        const [aluno] = await connection.execute(
            'SELECT * FROM aluno WHERE ra = ?',
            [ra]
        );

        if (aluno.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Aluno não encontrado'
            });
        }

        // Buscar empréstimos ativos do aluno
        const [emprestimos] = await connection.execute(`
            SELECT 
                e.id,
                e.dataEmprestimo,
                l.titulo,
                l.autor,
                ex.id AS id_exemplar
            FROM emprestimo e
            INNER JOIN exemplar ex ON e.idExemplar = ex.id
            INNER JOIN livro l ON ex.idLivro = l.id
            WHERE e.idAluno = ? AND e.dataDevolucaoReal IS NULL
            ORDER BY e.dataEmprestimo DESC
        `, [aluno[0].id]);

        res.json({
            success: true,
            data: emprestimos
        });

    } catch (error) {
        console.error('Erro ao listar empréstimos:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

module.exports = router;