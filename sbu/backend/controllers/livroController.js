const Livro = require('../models/livro');
const Exemplar = require('../models/exemplar');
const { validarLivro } = require('../helpers/validations');

exports.cadastrarLivro = async (req, res) => {
    try {
        // 1. Receber dados da requisição
        let { titulo, isbn, autor, editora, anoPublicacao, categoria, numeroExemplares } = req.body;

        // --- CORREÇÃO DE FLUXO E LIMPEZA DO ISBN ---
        
        // 2. Limpar o ISBN imediatamente
        if (isbn) {
            // Remove todos os não-dígitos para garantir que a validação e o BD recebam a forma pura
            isbn = String(isbn).replace(/[^0-9]/g, '');
        } else {
            // Garante que o isbn é null se estiver vazio
            isbn = null; 
        }
        
        // Nota: O ISBN agora está LIMPO ou NULL.
        // ------------------------------------------

        // 3. Validar campos (usando o ISBN JÁ LIMPO)
        const erros = validarLivro({ titulo, isbn, autor, editora, anoPublicacao, numeroExemplares });
        if (erros.length > 0) {
            return res.status(400).json({ success: false, error: erros.join(' ') });
        }

        // 4. Criar livro (usando o ISBN JÁ LIMPO)
        const result = await Livro.criar({ titulo, isbn, autor, editora, anoPublicacao, categoria });
        const idLivro = result.insertId;

        // 5. Criar exemplares
        let quantidadeExemplares = parseInt(numeroExemplares);
        if (isNaN(quantidadeExemplares) || quantidadeExemplares < 0) quantidadeExemplares = 0;

        let resultadoExemplares = null;
        if (quantidadeExemplares > 0) {
            resultadoExemplares = await Exemplar.criarMultiplos(idLivro, quantidadeExemplares);
        } else {
            resultadoExemplares = { exemplares: [], totalCriados: 0, totalErros: 0, erros: [] };
        }

        // 6. Resposta
        res.status(201).json({
            success: true,
            message: `Livro cadastrado com sucesso. ${resultadoExemplares.totalCriados} exemplar(es) criado(s).`,
            data: { 
                id: idLivro,
                titulo,
                isbn, // O ISBN aqui é o valor LIMPO ou null
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
