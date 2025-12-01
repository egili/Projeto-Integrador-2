const express = require('express');
const router = express.Router();
const { listarClassificacaoGeral, obterClassificacaoAluno } = require('../controllers/classificacaoController');

router.get('/geral', listarClassificacaoGeral);
router.get('/aluno/:ra', obterClassificacaoAluno);

module.exports = router;
