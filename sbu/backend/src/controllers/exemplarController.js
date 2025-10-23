const Exemplar = require('../models/exemplar');
const Livro = require('../models/livro');

exports.cadastrarExemplar = async (req, res) => {
    try {
        const { idLivro, codigo, observacoes, data_aquisicao } = req.body;

        // Verificar se livro existe
        const livro = await Livro.buscarPorId(idLivro);
        if (!livro) {
            return res.status(404).json({
                success: false,
                error: 'Livro não encontrado'
            });
        }

        // Verificar se código já existe
        const exemplarExistente = await Exemplar.buscarPorCodigo(codigo);
        if (exemplarExistente) {
            return res.status(400).json({
                success: false,
                error: 'Código do exemplar já existe'
            });
        }

        // Criar exemplar
        const result = await Exemplar.criar({
            idLivro,
            codigo,
            observacoes,
            data_aquisicao
        });

        res.status(201).json({
            success: true,
            message: 'Exemplar cadastrado com sucesso',
            data: {
                id: result.insertId,
                codigo,
                livro: livro.titulo
            }
        });

    } catch (error) {
        console.error('Erro ao cadastrar exemplar:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.listarExemplaresDisponiveis = async (req, res) => {
    try {
        const exemplares = await Exemplar.listarDisponiveis();

        res.json({
            success: true,
            data: exemplares,
            total: exemplares.length
        });

    } catch (error) {
        console.error('Erro ao listar exemplares disponíveis:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.listarExemplaresPorLivro = async (req, res) => {
    try {
        const { idLivro } = req.params;
        const exemplares = await Exemplar.listarPorLivro(idLivro);

        res.json({
            success: true,
            data: exemplares,
            total: exemplares.length
        });

    } catch (error) {
        console.error('Erro ao listar exemplares por livro:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.listarTodosExemplares = async (req, res) => {
    try {
        const exemplares = await Exemplar.listarTodos();

        res.json({
            success: true,
            data: exemplares,
            total: exemplares.length
        });

    } catch (error) {
        console.error('Erro ao listar todos os exemplares:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.buscarExemplarPorCodigo = async (req, res) => {
    try {
        const { codigo } = req.params;
        const exemplar = await Exemplar.buscarPorCodigo(codigo);

        if (!exemplar) {
            return res.status(404).json({
                success: false,
                error: 'Exemplar não encontrado'
            });
        }

        res.json({
            success: true,
            data: exemplar
        });

    } catch (error) {
        console.error('Erro ao buscar exemplar por código:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.atualizarExemplar = async (req, res) => {
    try {
        const { id } = req.params;
        const dadosExemplar = req.body;

        // Verificar se exemplar existe
        const exemplar = await Exemplar.buscarPorId(id);
        if (!exemplar) {
            return res.status(404).json({
                success: false,
                error: 'Exemplar não encontrado'
            });
        }

        // Atualizar exemplar
        await Exemplar.atualizar(id, dadosExemplar);

        res.json({
            success: true,
            message: 'Exemplar atualizado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao atualizar exemplar:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.deletarExemplar = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar se exemplar existe
        const exemplar = await Exemplar.buscarPorId(id);
        if (!exemplar) {
            return res.status(404).json({
                success: false,
                error: 'Exemplar não encontrado'
            });
        }

        // Verificar se exemplar está emprestado
        if (exemplar.status === 'emprestado') {
            return res.status(400).json({
                success: false,
                error: 'Não é possível deletar exemplar que está emprestado'
            });
        }

        // Deletar exemplar
        await Exemplar.deletar(id);

        res.json({
            success: true,
            message: 'Exemplar deletado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao deletar exemplar:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};