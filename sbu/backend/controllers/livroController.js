const Livro = require('../models/livro');
const Exemplar = require('../models/exemplar');
const { validarLivro } = require('../helpers/validations');

exports.cadastrarLivro = async (req, res) => {
    try {
        const { titulo, isbn, autor, editora, anoPublicacao, categoria, numeroExemplares } = req.body;

        // Validar campos
        const erros = validarLivro({ titulo, isbn, autor, editora, anoPublicacao, numeroExemplares });
        if (erros.length > 0) {
            return res.status(400).json({ success: false, error: erros.join(' ') });
        }

        // Criar livro
        const result = await Livro.criar({ titulo, isbn, autor, editora, anoPublicacao, categoria });
        const idLivro = result.insertId;

        // Criar exemplares
        let quantidadeExemplares = parseInt(numeroExemplares);
        if (isNaN(quantidadeExemplares) || quantidadeExemplares < 0) quantidadeExemplares = 0;

        let resultadoExemplares = null;
        if (quantidadeExemplares > 0) {
            resultadoExemplares = await Exemplar.criarMultiplos(idLivro, quantidadeExemplares);
        } else {
            resultadoExemplares = { exemplares: [], totalCriados: 0, totalErros: 0, erros: [] };
        }

        res.status(201).json({
            success: true,
            message: `Livro cadastrado com sucesso. ${resultadoExemplares.totalCriados} exemplar(es) criado(s).`,
            data: { 
                id: idLivro,
                titulo,
                isbn,
                autor,
                editora,
                anoPublicacao,
                categoria,
                exemplaresCriados: resultadoExemplares.totalCriados,
                exemplaresSolicitados: quantidadeExemplares,
                exemplaresComErro: resultadoExemplares.totalErros,
                erros: resultadoExemplares.erros.length > 0 ? resultadoExemplares.erros : undefined
            }
        });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, error: 'ISBN já cadastrado' });
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
        res.json({ success: true, data: livros, total: livros.length });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    }
};

exports.listarLivrosDisponiveis = async (req, res) => {
    try {
        const livros = await Livro.listarDisponiveis();
        res.json({ success: true, data: livros, total: livros.length });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    }
};

exports.buscarLivros = async (req, res) => {
    try {
        const { titulo, autor } = req.query;
        let livros;

        if (titulo) livros = await Livro.buscarPorTitulo(titulo);
        else if (autor) livros = await Livro.buscarPorAutor(autor);
        else livros = await Livro.listarDisponiveis();

        res.json({ success: true, data: livros, total: livros.length });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    }
};

exports.buscarLivroPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const livro = await Livro.buscarPorId(id);
        if (!livro) return res.status(404).json({ success: false, error: 'Livro não encontrado' });
        res.json({ success: true, data: livro });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    }
};

// Adicionar exemplares depois do cadastro
exports.adicionarExemplares = async (req, res) => {
    try {
        const idLivro = parseInt(req.params.idLivro);
        const quantidade = parseInt(req.body.quantidade);

        if (isNaN(quantidade) || quantidade <= 0) {
            return res.status(400).json({ success: false, error: 'Quantidade inválida' });
        }

        const livro = await Livro.buscarPorId(idLivro);
        if (!livro) return res.status(404).json({ success: false, error: 'Livro não encontrado' });

        const resultado = await Exemplar.criarMultiplos(idLivro, quantidade);

        res.json({
            success: true,
            message: `${resultado.totalCriados} exemplar(es) adicionados.`,
            data: resultado
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    }
};
