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
            data_aquisicao: data_aquisicao || new Date().toISOString().split('T')[0]
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

exports.listarExemplares = async (req, res) => {
    try {
        const { status, idLivro } = req.query;
        
        let exemplares;
        
        if (idLivro) {
            exemplares = await Exemplar.listarPorLivro(idLivro);
        } else if (status) {
            exemplares = await Exemplar.buscarPorStatus(status);
        } else {
            exemplares = await Exemplar.listarTodos();
        }

        res.json({
            success: true,
            data: exemplares,
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
        const { idLivro } = req.query;
        
        let exemplares;
        
        if (idLivro) {
            exemplares = await Exemplar.listarDisponiveisPorLivro(idLivro);
        } else {
            exemplares = await Exemplar.listarDisponiveis();
        }

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
        const { codigo, status, observacoes, data_aquisicao } = req.body;

        // Verificar se exemplar existe
        const exemplar = await Exemplar.buscarPorId(id);
        if (!exemplar) {
            return res.status(404).json({
                success: false,
                error: 'Exemplar não encontrado'
            });
        }

        // Verificar se código já existe (se foi alterado)
        if (codigo && codigo !== exemplar.codigo) {
            const exemplarExistente = await Exemplar.buscarPorCodigo(codigo);
            if (exemplarExistente) {
                return res.status(400).json({
                    success: false,
                    error: 'Código do exemplar já existe'
                });
            }
        }

        // Atualizar exemplar
        await Exemplar.atualizar(id, {
            codigo: codigo || exemplar.codigo,
            status: status || exemplar.status,
            observacoes: observacoes !== undefined ? observacoes : exemplar.observacoes,
            data_aquisicao: data_aquisicao || exemplar.data_aquisicao
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

exports.atualizarStatusExemplar = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, observacoes } = req.body;

        // Verificar se exemplar existe
        const exemplar = await Exemplar.buscarPorId(id);
        if (!exemplar) {
            return res.status(404).json({
                success: false,
                error: 'Exemplar não encontrado'
            });
        }

        // Atualizar status
        await Exemplar.atualizarStatus(id, status, observacoes);

        res.json({
            success: true,
            message: 'Status do exemplar atualizado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao atualizar status do exemplar:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.excluirExemplar = async (req, res) => {
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
                error: 'Não é possível excluir exemplar que está emprestado'
            });
        }

        // Excluir exemplar
        await Exemplar.excluir(id);

        res.json({
            success: true,
            message: 'Exemplar excluído com sucesso'
        });

    } catch (error) {
        console.error('Erro ao excluir exemplar:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};