const express = require('express');
const router = express.Router();
const livroController = require('../controllers/livroController');

router.post('/', livroController.cadastrarLivro);
router.post('/adicionar-exemplares/:idLivro', livroController.adicionarExemplares);
router.get('/busca', livroController.buscarLivros);
router.get('/disponiveis', livroController.listarLivrosDisponiveis);
router.get('/', livroController.listarTodosLivros);
router.get('/:id', livroController.buscarLivroPorId);

module.exports = router;
