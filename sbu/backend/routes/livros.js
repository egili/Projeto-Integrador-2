const express = require('express');
const router = express.Router();
const livroController = require('../controllers/livroController');

router.post('/', livroController.cadastrarLivro);
router.get('/busca', livroController.buscarLivros); 
router.get('/disponiveis', livroController.listarLivrosDisponiveis);
router.get('/', livroController.listarTodosLivros);

router.get('/:id', livroController.buscarLivroPorId); 
router.put('/:id', livroController.atualizarLivro);    
router.delete('/:id', livroController.removerLivro);  

module.exports = router;