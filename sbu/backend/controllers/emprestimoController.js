const Emprestimo = require('../models/emprestimo');
const Aluno = require('../models/aluno');
const Livro = require('../models/livro');
const Classificacao = require('../models/classificacao');
const Semestre = require('../models/semestre');

exports.realizarEmprestimo = async (req, res) => {
    try {
        const { raAluno, idLivro } = req.body;

        const aluno = await Aluno.buscarPorRa(raAluno);
        if (!aluno) {
            return res.status(404).json({
                success: false,
                error: 'Aluno não encontrado'
            });
        }

        const livro = await Livro.buscarPorId(idLivro);
        if (!livro) {
            return res.status(404).json({
                success: false,
                error: 'Livro não encontrado'
            });
        }

        const livroDisponivel = await Emprestimo.verificarLivroDisponivel(idLivro);
        if (!livroDisponivel) {
            return res.status(400).json({
                success: false,
                error: 'Livro já emprestado'
            });
        }

        const dataEmprestimo = new Date().toISOString().split('T')[0];

        const result = await Emprestimo.criar({
            idAluno: aluno.id,
            idLivro,
            dataEmprestimo
        });

        res.status(201).json({
            success: true,
            message: 'Empréstimo realizado com sucesso',
            data: {
                id: result.insertId,
                aluno: aluno.nome,
                livro: livro.titulo,
                dataEmprestimo
            }
        });

    } catch (error) {
        console.error('Erro ao realizar empréstimo:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.registrarDevolucao = async (req, res) => {
    try {
        const { idEmprestimo } = req.body;

        const emprestimo = await Emprestimo.buscarPorId(idEmprestimo);
        if (!emprestimo) {
            return res.status(404).json({
                success: false,
                error: 'Empréstimo não encontrado'
            });
        }

        if (emprestimo.dataDevolucaoReal) {
            return res.status(400).json({
                success: false,
                error: 'Livro já devolvido'
            });
        }

        const dataDevolucaoReal = new Date().toISOString().split('T')[0];
        await Emprestimo.registrarDevolucao(idEmprestimo, dataDevolucaoReal);

        const semestreAtivo = await Semestre.buscarAtivo();
        if (semestreAtivo) {
            const classificacao = await Classificacao.calcularClassificacao(
                emprestimo.idAluno, 
                semestreAtivo.id
            );
            
            await Classificacao.atualizarClassificacaoAluno(
                emprestimo.idAluno,
                semestreAtivo.id,
                classificacao.codigo,
                classificacao.descricao
            );
        }

        res.json({
            success: true,
            message: 'Devolução registrada com sucesso',
            data: {
                emprestimo: idEmprestimo,
                dataDevolucaoReal,
                classificacao: classificacao || null
            }
        });

    } catch (error) {
        console.error('Erro ao registrar devolução:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.listarEmprestimosAtivosPorAluno = async (req, res) => {
    try {
        const { ra } = req.params;

        const aluno = await Aluno.buscarPorRa(ra);
        if (!aluno) {
            return res.status(404).json({
                success: false,
                error: 'Aluno não encontrado'
            });
        }

        const emprestimos = await Emprestimo.listarAtivosPorAluno(aluno.id);

        res.json({
            success: true,
            data: emprestimos,
            total: emprestimos.length
        });

    } catch (error) {
        console.error('Erro ao listar empréstimos ativos:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.listarTodosEmprestimosAtivos = async (req, res) => {
    try {
        const emprestimos = await Emprestimo.listarEmprestimosAtivos();

        res.json({
            success: true,
            data: emprestimos,
            total: emprestimos.length
        });

    } catch (error) {
        console.error('Erro ao listar todos os empréstimos ativos:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};