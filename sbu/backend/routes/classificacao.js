const express = require('express');
const router = express.Router();
const classificacaoController = require('../controllers/classificacaoController');

router.get('/aluno/:ra', classificacaoController.obterClassificacaoAluno);
router.get('/geral', classificacaoController.listarClassificacaoGeral);

module.exports = router;

