const express = require('express');
const router = express.Router();
const livroController = require('../controllers/livroController');

// Cadastrar livro
router.post('/', livroController.cadastrarLivro);

// Buscar livros (com filtros opcionais)
router.get('/busca', livroController.buscarLivros);

// Listar livros disponíveis (com exemplares)
router.get('/disponiveis', livroController.listarLivrosDisponiveis);

// Listar todos os livros
router.get('/', livroController.listarTodosLivros);

// Buscar livro por ID
router.get('/:id', livroController.buscarLivroPorId);

module.exports = router;
