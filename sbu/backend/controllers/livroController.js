const Livro = require('../models/livro');
const Exemplar = require('../models/exemplar');
const { validarLivro } = require('../helpers/validations');

// --- CADASTRO DE LIVRO ---
exports.cadastrarLivro = async (req, res) => {
    try {
        let { titulo, isbn, autor, editora, anoPublicacao, categoria, numeroExemplares } = req.body;

        // Limpeza e normalização do ISBN
        if (isbn) { isbn = String(isbn).replace(/[^0-9]/g, ''); } else { isbn = null; }

        // Validação
        const erros = validarLivro({ titulo, isbn, autor, editora, anoPublicacao, categoria, numeroExemplares });
        if (erros.length > 0) { return res.status(400).json({ success: false, error: erros.join(' ') }); }

        // Criação do livro
        const result = await Livro.criar({ titulo, isbn, autor, editora, anoPublicacao, categoria });
        const idLivro = result.insertId;

        // Criação de exemplares
        let quantidadeExemplares = parseInt(numeroExemplares);
        if (isNaN(quantidadeExemplares) || quantidadeExemplares < 0) quantidadeExemplares = 0;

        let resultadoExemplares = null;
        if (quantidadeExemplares > 0) {
            resultadoExemplares = await Exemplar.criarMultiplos(idLivro, quantidadeExemplares);
        } else {
            resultadoExemplares = { exemplares: [], totalCriados: 0, totalErros: 0, erros: [] };
        }

        // Resposta
        res.status(201).json({
            success: true,
            message: `Livro cadastrado com sucesso. ${resultadoExemplares.totalCriados} exemplar(es) criado(s).`,
            data: { id: idLivro, titulo, isbn, autor, editora, anoPublicacao, categoria, exemplaresCriados: resultadoExemplares.totalCriados }
        });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') { return res.status(400).json({ success: false, error: 'ISBN já cadastrado' }); }
        
        const errorMessage = error.message; 
        console.error("Erro no cadastro:", error); 
        
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            details: errorMessage
        });
    }
};

// --- LISTAGEM E BUSCA ---

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

// --- ATUALIZAÇÃO E REMOÇÃO ---

exports.atualizarLivro = async (req, res) => {
    try {
        const { id } = req.params;
        let { titulo, isbn, autor, editora, anoPublicacao, categoria } = req.body;
        
        if (isbn) { isbn = String(isbn).replace(/[^0-9]/g, ''); } else { isbn = null; }

        const erros = validarLivro({ titulo, isbn, autor, editora, anoPublicacao, categoria, numeroExemplares: 1 }); 

        if (erros.length > 0) { return res.status(400).json({ success: false, error: erros.join(' ') }); }

        const result = await Livro.atualizar(id, { titulo, isbn, autor, editora, anoPublicacao, categoria });

        if (result.affectedRows === 0) { return res.status(404).json({ success: false, error: 'Livro não encontrado.' }); }

        res.json({ success: true, message: 'Livro atualizado com sucesso.' });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') { return res.status(400).json({ success: false, error: 'ISBN já cadastrado em outro livro.' }); }
        res.status(500).json({ success: false, error: 'Erro interno do servidor na atualização.' });
    }
};

exports.removerLivro = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await Livro.remover(id);

        if (result.affectedRows === 0) { return res.status(404).json({ success: false, error: 'Livro não encontrado.' }); }

        res.json({ success: true, message: `Livro ID ${id} e exemplares relacionados removidos.` });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Erro interno do servidor na remoção.' });
    }
};