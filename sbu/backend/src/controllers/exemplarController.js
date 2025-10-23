const Exemplar = require('../models/exemplar');
const Livro = require('../models/livro');
const Log = require('../models/log');

exports.cadastrarExemplar = async (req, res) => {
    try {
        const { idLivro, codigo, status = 'disponivel', observacoes } = req.body;

        if (!idLivro || !codigo) {
            return res.status(400).json({
                success: false,
                error: 'ID do livro e código são obrigatórios'
            });
        }

        // Verificar se livro existe
        const livro = await Livro.buscarPorId(idLivro);
        if (!livro) {
            await Log.logErro(`Tentativa de cadastrar exemplar para livro inexistente: ${idLivro}`);
            return res.status(404).json({
                success: false,
                error: 'Livro não encontrado'
            });
        }

        // Verificar se código já existe
        const exemplarExistente = await Exemplar.buscarPorCodigo(codigo);
        if (exemplarExistente) {
            await Log.logErro(`Tentativa de cadastrar exemplar com código duplicado: ${codigo}`);
            return res.status(400).json({
                success: false,
                error: 'Código de exemplar já cadastrado'
            });
        }

        const result = await Exemplar.criar({ idLivro, codigo, status, observacoes });
        
        await Log.logSucesso(`Exemplar cadastrado: ${codigo} - ${livro.titulo}`);

        res.status(201).json({
            success: true,
            message: 'Exemplar cadastrado com sucesso',
            data: { 
                id: result.insertId, 
                idLivro, 
                codigo, 
                status, 
                observacoes,
                livro: livro.titulo
            }
        });

    } catch (error) {
        console.error('Erro ao cadastrar exemplar:', error);
        await Log.logExcecao(`Erro ao cadastrar exemplar: ${error.message}`);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.listarExemplares = async (req, res) => {
    try {
        const { idLivro } = req.query;
        let exemplares;

        if (idLivro) {
            exemplares = await Exemplar.listarPorLivro(idLivro);
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
        await Log.logExcecao(`Erro ao listar exemplares: ${error.message}`);
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
        await Log.logExcecao(`Erro ao listar exemplares disponíveis: ${error.message}`);
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
        await Log.logExcecao(`Erro ao buscar exemplar: ${error.message}`);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.atualizarExemplar = async (req, res) => {
    try {
        const { id } = req.params;
        const { idLivro, codigo, status, observacoes } = req.body;

        // Verificar se exemplar existe
        const exemplarExistente = await Exemplar.buscarPorId(id);
        if (!exemplarExistente) {
            return res.status(404).json({
                success: false,
                error: 'Exemplar não encontrado'
            });
        }

        // Se mudou o código, verificar se não existe outro com o mesmo código
        if (codigo && codigo !== exemplarExistente.codigo) {
            const exemplarComCodigo = await Exemplar.buscarPorCodigo(codigo);
            if (exemplarComCodigo) {
                return res.status(400).json({
                    success: false,
                    error: 'Código de exemplar já cadastrado'
                });
            }
        }

        const result = await Exemplar.atualizar(id, { idLivro, codigo, status, observacoes });
        
        await Log.logSucesso(`Exemplar atualizado: ${codigo || exemplarExistente.codigo}`);

        res.json({
            success: true,
            message: 'Exemplar atualizado com sucesso',
            data: { id, idLivro, codigo, status, observacoes }
        });

    } catch (error) {
        console.error('Erro ao atualizar exemplar:', error);
        await Log.logExcecao(`Erro ao atualizar exemplar: ${error.message}`);
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

        // Verificar se exemplar não está emprestado
        if (exemplar.status === 'emprestado') {
            return res.status(400).json({
                success: false,
                error: 'Não é possível deletar exemplar emprestado'
            });
        }

        await Exemplar.deletar(id);
        
        await Log.logSucesso(`Exemplar deletado: ${exemplar.codigo}`);

        res.json({
            success: true,
            message: 'Exemplar deletado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao deletar exemplar:', error);
        await Log.logExcecao(`Erro ao deletar exemplar: ${error.message}`);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};