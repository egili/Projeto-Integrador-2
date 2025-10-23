const Livro = require('../models/livro');
const Log = require('../models/log');

exports.cadastrarLivro = async (req, res) => {
    try {
        const { titulo, isbn, autor, editora, anoPublicacao } = req.body;

        if (!titulo || !autor || !editora || !anoPublicacao) {
            return res.status(400).json({
                success: false,
                error: 'Título, autor, editora e ano de publicação são obrigatórios'
            });
        }

        // Se ISBN foi fornecido, verifica se já existe
        if (isbn) {
            const livroExistente = await Livro.buscarPorIsbn(isbn);
            if (livroExistente) {
                return res.status(400).json({
                    success: false,
                    error: 'ISBN já cadastrado'
                });
            }
        }

        const result = await Livro.criar({ titulo, isbn, autor, editora, anoPublicacao });
        try { await Log.registrar('sucesso', `Livro cadastrado: ${titulo} (${isbn || 'SEM ISBN'})`);} catch (_) {}
        
        res.status(201).json({
            success: true,
            message: 'Livro cadastrado com sucesso',
            data: { 
                id: result.insertId, 
                titulo, 
                isbn, 
                autor, 
                editora, 
                anoPublicacao 
            }
        });

    } catch (error) {
        console.error('Erro ao cadastrar livro:', error);
        try { await Log.registrar('erro', `Falha ao cadastrar livro: ${error.message}`);} catch (_) {}
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.listarLivrosDisponiveis = async (req, res) => {
    try {
        const livros = await Livro.listarDisponiveis();

        res.json({
            success: true,
            data: livros,
            total: livros.length
        });

    } catch (error) {
        console.error('Erro ao listar livros disponíveis:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.buscarLivros = async (req, res) => {
    try {
        const { titulo, autor } = req.query;
        let livros;

        if (titulo) {
            // Quando buscar por título, preferir apenas livros com exemplar disponível
            const todos = await Livro.buscarPorTitulo(titulo);
            const disponiveis = await Livro.listarDisponiveis();
            const idsDisponiveis = new Set(disponiveis.map(l => l.id));
            livros = todos.filter(l => idsDisponiveis.has(l.id));
        } else if (autor) {
            const todos = await Livro.buscarPorAutor(autor);
            const disponiveis = await Livro.listarDisponiveis();
            const idsDisponiveis = new Set(disponiveis.map(l => l.id));
            livros = todos.filter(l => idsDisponiveis.has(l.id));
        } else {
            livros = await Livro.listarDisponiveis();
        }

        res.json({
            success: true,
            data: livros,
            total: livros.length
        });

    } catch (error) {
        console.error('Erro ao buscar livros:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.listarTodosLivros = async (req, res) => {
    try {
        const livros = await Livro.listarTodos();

        res.json({
            success: true,
            data: livros,
            total: livros.length
        });

    } catch (error) {
        console.error('Erro ao listar todos os livros:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.buscarLivroPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const livro = await Livro.buscarPorId(id);
        if (!livro) {
            return res.status(404).json({
                success: false,
                error: 'Livro não encontrado'
            });
        }

        res.json({
            success: true,
            data: livro
        });

    } catch (error) {
        console.error('Erro ao buscar livro:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};