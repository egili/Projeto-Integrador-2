const express = require('express');
const router = express.Router();
const { listarClassificacaoGeral } = require('../controllers/classificacaoController');

router.get('/geral', listarClassificacaoGeral);

module.exports = router;
