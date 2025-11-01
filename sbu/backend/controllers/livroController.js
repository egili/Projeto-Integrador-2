const Livro = require('../models/livro');
const Exemplar = require('../models/exemplar');

exports.cadastrarLivro = async (req, res) => {
    try {
        const { titulo, isbn, autor, editora, anoPublicacao, categoria, numeroExemplares } = req.body;

        if (!titulo || !autor) {
            return res.status(400).json({
                success: false,
                error: 'Título e autor são obrigatórios'
            });
        }

        const result = await Livro.criar({
            titulo,
            isbn,
            autor,
            editora,
            anoPublicacao,
            categoria
        });

        const idLivro = result.insertId;
        const quantidadeExemplares = numeroExemplares ? parseInt(numeroExemplares) : 1;
        
        let resultadoExemplares = null;
        
        if (quantidadeExemplares > 0 && quantidadeExemplares <= 100) {
            try {
                resultadoExemplares = await Exemplar.criarMultiplos(idLivro, quantidadeExemplares);
            } catch (error) {
                resultadoExemplares = {
                    exemplares: [],
                    totalCriados: 0,
                    totalErros: quantidadeExemplares,
                    erros: [{ erro: error.message }]
                };
            }
        } else {
            resultadoExemplares = {
                exemplares: [],
                totalCriados: 0,
                totalErros: 0,
                erros: []
            };
        }

        const exemplaresCriados = resultadoExemplares ? resultadoExemplares.totalCriados : 0;
        
        res.status(201).json({
            success: true,
            message: `Livro cadastrado com sucesso. ${exemplaresCriados} exemplar(es) criado(s).`,
            data: { 
                id: idLivro, 
                titulo,
                isbn,
                autor,
                editora,
                anoPublicacao,
                categoria,
                exemplaresCriados: exemplaresCriados,
                exemplaresSolicitados: quantidadeExemplares,
                exemplaresComErro: resultadoExemplares ? resultadoExemplares.totalErros : 0,
                erros: resultadoExemplares && resultadoExemplares.erros.length > 0 ? resultadoExemplares.erros : undefined
            }
        });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                error: 'ISBN já cadastrado'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
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
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};
