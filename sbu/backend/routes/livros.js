const express = require('express');
const router = express.Router();
const livroController = require('../controllers/livroController');

// Rota de Cadastro
router.post('/', livroController.cadastrarLivro);

// Rota de Busca por Termo (Título ou Autor)
router.get('/busca', livroController.buscarLivros); 

// Rota de Listagem de Disponíveis
router.get('/disponiveis', livroController.listarLivrosDisponiveis);

// Rota de Listagem Geral (Deve ser a última GET sem parâmetros)
router.get('/', livroController.listarTodosLivros); // LINHA 10 DO ERRO

// Rotas específicas por ID
router.get('/:id', livroController.buscarLivroPorId); 
router.put('/:id', livroController.atualizarLivro);    
router.delete('/:id', livroController.removerLivro);  

module.exports = router;