const express = require('express');
const router = express.Router();
const livroController = require('../controllers/livroController');

// Cadastrar livro (bibliotecário)
router.post('/', livroController.cadastrarLivro);

// Listar todos os livros (bibliotecário)
router.get('/', livroController.listarTodosLivros);

// Listar livros disponíveis (aluno)
router.get('/disponiveis', livroController.listarLivrosDisponiveis);

// Buscar livros por título ou autor
router.get('/busca', livroController.buscarLivros);

// Buscar livro por ID
router.get('/:id', livroController.buscarLivroPorId);

module.exports = router;

