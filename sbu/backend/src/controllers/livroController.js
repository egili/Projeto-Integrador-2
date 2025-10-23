const Livro = require('../models/livro');
const Exemplar = require('../models/exemplar');

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
            livros = await Livro.buscarPorTitulo(titulo);
        } else if (autor) {
            livros = await Livro.buscarPorAutor(autor);
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

        // Buscar exemplares do livro
        const exemplares = await Exemplar.listarPorLivro(id);

        res.json({
            success: true,
            data: {
                ...livro,
                exemplares: exemplares
            }
        });

    } catch (error) {
        console.error('Erro ao buscar livro:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.listarLivrosComExemplares = async (req, res) => {
    try {
        const livros = await Livro.listarTodos();
        
        // Para cada livro, buscar seus exemplares
        const livrosComExemplares = await Promise.all(
            livros.map(async (livro) => {
                const exemplares = await Exemplar.listarPorLivro(livro.id);
                return {
                    ...livro,
                    exemplares: exemplares,
                    totalExemplares: exemplares.length,
                    exemplaresDisponiveis: exemplares.filter(ex => ex.status === 'disponivel').length
                };
            })
        );

        res.json({
            success: true,
            data: livrosComExemplares,
            total: livrosComExemplares.length
        });

    } catch (error) {
        console.error('Erro ao listar livros com exemplares:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.listarLivrosDisponiveisComExemplares = async (req, res) => {
    try {
        const livros = await Livro.listarTodos();
        
        // Filtrar apenas livros que têm exemplares disponíveis
        const livrosComExemplaresDisponiveis = [];
        
        for (const livro of livros) {
            const exemplaresDisponiveis = await Exemplar.listarDisponiveisPorLivro(livro.id);
            if (exemplaresDisponiveis.length > 0) {
                livrosComExemplaresDisponiveis.push({
                    ...livro,
                    exemplares: exemplaresDisponiveis,
                    totalExemplares: exemplaresDisponiveis.length
                });
            }
        }

        res.json({
            success: true,
            data: livrosComExemplaresDisponiveis,
            total: livrosComExemplaresDisponiveis.length
        });

    } catch (error) {
        console.error('Erro ao listar livros disponíveis com exemplares:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};