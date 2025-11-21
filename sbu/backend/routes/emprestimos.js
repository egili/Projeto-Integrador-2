const express = require('express');
const router = express.Router();
const { connection } = require('../database/connection');

router.post('/', async (req, res) => {
    try {
        const { idAluno, idExemplar } = req.body;

        if (!idAluno || !idExemplar) {
            return res.status(400).json({
                success: false,
                error: 'ID do aluno e ID do exemplar são obrigatórios'
            });
        }

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

        const [result] = await connection.execute(
            'INSERT INTO emprestimo (idAluno, idExemplar, dataEmprestimo) VALUES (?, ?, NOW())',
            [idAluno, idExemplar]
        );

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

router.put('/:id/devolver', async (req, res) => {
    try {
        const { id } = req.params;

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

        await connection.execute(
            'UPDATE emprestimo SET dataDevolucaoReal = NOW() WHERE id = ?',
            [id]
        );

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

router.get('/aluno/:ra', async (req, res) => {
    try {
        const { ra } = req.params;

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

        const [emprestimos] = await connection.execute(`
            SELECT 
                e.id,
                e.dataEmprestimo,
                l.titulo,
                l.autor,
                ex.id as id_exemplar
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

