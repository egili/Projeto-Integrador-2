const express = require('express');
const router = express.Router();
const livroController = require('../controllers/livroController');

router.post('/', livroController.cadastrarLivro);
router.get('/busca', livroController.buscarLivros);
router.get('/disponiveis', livroController.listarLivrosDisponiveis);
router.get('/', livroController.listarTodosLivros);

router.get('/:id', livroController.buscarLivroPorId); // GET /api/livros/12
router.put('/:id', livroController.atualizarLivro);    // PUT /api/livros/12
router.delete('/:id', livroController.removerLivro);  // DELETE /api/livros/12

module.exports = router;
