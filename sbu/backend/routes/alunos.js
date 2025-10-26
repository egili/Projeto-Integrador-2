const express = require('express');
const router = express.Router();
const alunoController = require('../controllers/alunoController');

// Cadastrar aluno
router.post('/', alunoController.cadastrarAluno);

// Listar todos os alunos
router.get('/', alunoController.listarAlunos);

// Buscar aluno por RA
router.get('/ra/:ra', alunoController.buscarAlunoPorRa);

module.exports = router;

