const express = require('express');
const router = express.Router();
const { connection } = require('../database/connection');

// Listar exemplares por livro
router.get('/livro/:idLivro', async (req, res) => {
    try {
        const { idLivro } = req.params;
        
        const [rows] = await connection.execute(`
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
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor ao listar exemplares' 
        });
    }
});

// Cadastrar exemplar
router.post('/', async (req, res) => {
    try {
        const { idLivro, codigo, observacoes } = req.body;
        
        if (!idLivro || !codigo) {
            return res.status(400).json({ 
                success: false,
                error: 'ID do livro e código são obrigatórios' 
            });
        }

        const [result] = await connection.execute(
            'INSERT INTO exemplar (idLivro, codigo, status, observacoes) VALUES (?, ?, "disponivel", ?)',
            [idLivro, codigo, observacoes || null]
        );

        res.status(201).json({ 
            success: true,
            message: 'Exemplar cadastrado com sucesso',
            id: result.insertId
        });

    } catch (error) {
        console.error('Erro ao cadastrar exemplar:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ 
                success: false,
                error: 'Código do exemplar já cadastrado' 
            });
        }
        
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor ao cadastrar exemplar' 
        });
    }
});

// Buscar exemplar por código
router.get('/codigo/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        
        const [rows] = await connection.execute(`
            SELECT e.*, l.titulo, l.autor, l.editora, l.anoPublicacao
            FROM exemplar e
            JOIN livro l ON e.idLivro = l.id
            WHERE e.codigo = ?
        `, [codigo]);
        
        if (rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Exemplar não encontrado' 
            });
        }
        
        res.json({ 
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Erro ao buscar exemplar:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor ao buscar exemplar' 
        });
    }
});

module.exports = router;

