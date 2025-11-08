const express = require('express');
const router = express.Router();
const exemplarController = require('../controllers/exemplarController');

router.post('/', exemplarController.cadastrarExemplar);
router.get('/livro/:idLivro', exemplarController.listarExemplaresPorLivro);
router.get('/livro/:idLivro/disponiveis', exemplarController.listarExemplaresDisponiveisPorLivro);
router.put('/:id/status', exemplarController.atualizarStatusExemplar);
router.delete('/:id', exemplarController.deletarExemplar);

module.exports = router;

