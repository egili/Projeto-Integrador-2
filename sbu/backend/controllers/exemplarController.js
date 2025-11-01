const Exemplar = require('../models/exemplar');
const Livro = require('../models/livro');

exports.cadastrarExemplar = async (req, res) => {
    try {
        const { idLivro } = req.body;

        if (!idLivro) {
            return res.status(400).json({
                success: false,
                error: 'ID do livro é obrigatório'
            });
        }

        const livro = await Livro.buscarPorId(idLivro);
        if (!livro) {
            return res.status(404).json({
                success: false,
                error: 'Livro não encontrado'
            });
        }

        const result = await Exemplar.criar({
            idLivro,
            status: 'disponivel'
        });

        res.status(201).json({
            success: true,
            message: 'Exemplar cadastrado com sucesso',
            data: {
                id: result.insertId,
                idLivro,
                status: 'disponivel'
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.listarExemplaresPorLivro = async (req, res) => {
    try {
        const { idLivro } = req.params;

        const livro = await Livro.buscarPorId(idLivro);
        if (!livro) {
            return res.status(404).json({
                success: false,
                error: 'Livro não encontrado'
            });
        }

        const exemplares = await Exemplar.listarPorLivro(idLivro);

        res.json({
            success: true,
            data: exemplares,
            total: exemplares.length,
            livro: {
                id: livro.id,
                titulo: livro.titulo,
                autor: livro.autor
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.listarExemplaresDisponiveisPorLivro = async (req, res) => {
    try {
        const { idLivro } = req.params;

        const exemplares = await Exemplar.listarDisponiveisPorLivro(idLivro);

        res.json({
            success: true,
            data: exemplares,
            total: exemplares.length
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.atualizarStatusExemplar = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const statusValidos = ['disponivel', 'emprestado'];
        if (!status || !statusValidos.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Status inválido. Deve ser: disponivel ou emprestado'
            });
        }

        const exemplar = await Exemplar.buscarPorId(id);
        if (!exemplar) {
            return res.status(404).json({
                success: false,
                error: 'Exemplar não encontrado'
            });
        }

        await Exemplar.atualizarStatus(id, status);

        res.json({
            success: true,
            message: 'Status do exemplar atualizado com sucesso',
            data: {
                id: exemplar.id,
                status: status
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.deletarExemplar = async (req, res) => {
    try {
        const { id } = req.params;

        const exemplar = await Exemplar.buscarPorId(id);
        if (!exemplar) {
            return res.status(404).json({
                success: false,
                error: 'Exemplar não encontrado'
            });
        }

        await Exemplar.deletar(id);

        res.json({
            success: true,
            message: 'Exemplar deletado com sucesso'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};
