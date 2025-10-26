const express = require('express');
const router = express.Router();
const { connection } = require('../database/connection');

// Obter classificação geral (ranking de leitores)
router.get('/geral', async (req, res) => {
    try {
        const [rows] = await connection.execute(`
            SELECT a.nome, a.ra, 
                   COUNT(e.id) as total_livros_lidos,
                   COUNT(CASE WHEN e.dataDevolucaoReal IS NOT NULL THEN 1 END) as livros_devolvidos,
                   COUNT(CASE WHEN e.dataDevolucaoReal IS NULL THEN 1 END) as livros_pendentes
            FROM aluno a
            LEFT JOIN emprestimo e ON a.id = e.idAluno
            GROUP BY a.id
            ORDER BY livros_devolvidos DESC, a.nome
        `);
        
        res.json({ 
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Erro ao obter classificação geral:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor ao obter classificação geral' 
        });
    }
});

// Obter classificação por semestre
router.get('/semestre/:idSemestre', async (req, res) => {
    try {
        const { idSemestre } = req.params;
        
        const [semestre] = await connection.execute(
            'SELECT * FROM semestre WHERE id = ?',
            [idSemestre]
        );

        if (semestre.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Semestre não encontrado' 
            });
        }

        const [rows] = await connection.execute(`
            SELECT a.nome, a.ra, 
                   COUNT(e.id) as total_livros_lidos,
                   COUNT(CASE WHEN e.dataDevolucaoReal IS NOT NULL THEN 1 END) as livros_devolvidos
            FROM aluno a
            LEFT JOIN emprestimo e ON a.id = e.idAluno
            WHERE e.dataEmprestimo BETWEEN ? AND ?
            GROUP BY a.id
            ORDER BY livros_devolvidos DESC, a.nome
        `, [semestre[0].dataInicio, semestre[0].dataFim]);
        
        res.json({ 
            success: true,
            data: rows,
            semestre: semestre[0]
        });
    } catch (error) {
        console.error('Erro ao obter classificação por semestre:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor ao obter classificação' 
        });
    }
});

// Obter pontuação de um aluno específico
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

        const [rows] = await connection.execute(`
            SELECT 
                COUNT(e.id) as total_emprestimos,
                COUNT(CASE WHEN e.dataDevolucaoReal IS NOT NULL THEN 1 END) as livros_devolvidos,
                COUNT(CASE WHEN e.dataDevolucaoReal IS NULL THEN 1 END) as livros_pendentes
            FROM emprestimo e
            WHERE e.idAluno = ?
        `, [aluno[0].id]);
        
        res.json({ 
            success: true,
            data: {
                aluno: aluno[0],
                estatisticas: rows[0]
            }
        });
    } catch (error) {
        console.error('Erro ao obter pontuação do aluno:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor ao obter pontuação' 
        });
    }
});

// Listar todos os semestres
router.get('/semestres', async (req, res) => {
    try {
        const [rows] = await connection.execute('SELECT * FROM semestre ORDER BY dataInicio DESC');
        
        res.json({ 
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Erro ao listar semestres:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor ao listar semestres' 
        });
    }
});

module.exports = router;

