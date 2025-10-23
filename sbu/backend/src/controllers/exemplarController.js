const Exemplar = require('../models/exemplar');
const Livro = require('../models/livro');

exports.cadastrarExemplar = async (req, res) => {
    try {
        const { idLivro, codigo, status, observacoes, data_aquisicao } = req.body;

        if (!idLivro || !codigo) {
            return res.status(400).json({
                success: false,
                error: 'ID do livro e código do exemplar são obrigatórios'
            });
        }

        // Verificar se o livro existe
        const livro = await Livro.buscarPorId(idLivro);
        if (!livro) {
            return res.status(404).json({
                success: false,
                error: 'Livro não encontrado'
            });
        }

        // Verificar se o código já existe
        const exemplarExistente = await Exemplar.buscarPorCodigo(codigo);
        if (exemplarExistente) {
            return res.status(400).json({
                success: false,
                error: 'Código de exemplar já cadastrado'
            });
        }

        const result = await Exemplar.criar({ 
            idLivro, 
            codigo, 
            status: status || 'disponivel', 
            observacoes, 
            data_aquisicao 
        });

        res.status(201).json({
            success: true,
            message: 'Exemplar cadastrado com sucesso',
            data: { 
                id: result.insertId, 
                idLivro,
                codigo, 
                status: status || 'disponivel',
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
            data: {
                livro: {
                    id: livro.id,
                    titulo: livro.titulo,
                    autor: livro.autor,
                    isbn: livro.isbn
                },
                exemplares
            },
            total: exemplares.length
        });

    } catch (error) {
        console.error('Erro ao listar exemplares:', error);
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
        console.error('Erro ao buscar exemplar:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.buscarExemplarPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const exemplar = await Exemplar.buscarPorId(id);
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
        console.error('Erro ao buscar exemplar:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.atualizarExemplar = async (req, res) => {
    try {
        const { id } = req.params;
        const { codigo, status, observacoes } = req.body;

        const exemplar = await Exemplar.buscarPorId(id);
        if (!exemplar) {
            return res.status(404).json({
                success: false,
                error: 'Exemplar não encontrado'
            });
        }

        // Se está alterando o código, verificar se não existe outro com o mesmo código
        if (codigo && codigo !== exemplar.codigo) {
            const exemplarComCodigo = await Exemplar.buscarPorCodigo(codigo);
            if (exemplarComCodigo) {
                return res.status(400).json({
                    success: false,
                    error: 'Código já está em uso por outro exemplar'
                });
            }
        }

        await Exemplar.atualizar(id, { 
            codigo: codigo || exemplar.codigo, 
            status: status || exemplar.status, 
            observacoes: observacoes !== undefined ? observacoes : exemplar.observacoes 
        });

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
        console.error('Erro ao deletar exemplar:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};
