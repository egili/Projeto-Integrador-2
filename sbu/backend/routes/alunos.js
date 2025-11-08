const express = require('express');
const router = express.Router();
const alunoController = require('../controllers/alunoController');

router.post('/', alunoController.cadastrarAluno);

router.get('/', alunoController.listarAlunos);

router.get('/ra/:ra', alunoController.buscarAlunoPorRa);

module.exports = router;
