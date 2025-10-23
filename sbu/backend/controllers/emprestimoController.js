const Emprestimo = require('../models/emprestimo');
const Aluno = require('../models/aluno');
const Livro = require('../models/livro');
const Classificacao = require('../models/classificacao');
const Semestre = require('../models/semestre');

exports.realizarEmprestimo = async (req, res) => {
    try {
        const { raAluno, idLivro } = req.body;

        // Verificar se aluno existe
        const aluno = await Aluno.buscarPorRa(raAluno);
        if (!aluno) {
            return res.status(404).json({
                success: false,
                error: 'Aluno não encontrado'
            });
        }

        // Verificar se livro existe
        const livro = await Livro.buscarPorId(idLivro);
        if (!livro) {
            return res.status(404).json({
                success: false,
                error: 'Livro não encontrado'
            });
        }

        // Verificar se livro está disponível
        const livroDisponivel = await Emprestimo.verificarLivroDisponivel(idLivro);
        if (!livroDisponivel) {
            return res.status(400).json({
                success: false,
                error: 'Livro já emprestado'
            });
        }

        // Calcular datas
        const dataEmprestimo = new Date().toISOString().split('T')[0];
        const dataDevolucaoPrevista = new Date();
        dataDevolucaoPrevista.setDate(dataDevolucaoPrevista.getDate() + 7);
        const dataDevolucaoPrevistaStr = dataDevolucaoPrevista.toISOString().split('T')[0];

        // Registrar empréstimo
        const result = await Emprestimo.criar({
            idAluno: aluno.id,
            idLivro,
            dataEmprestimo,
            dataDevolucaoPrevista: dataDevolucaoPrevistaStr
        });

        res.status(201).json({
            success: true,
            message: 'Empréstimo realizado com sucesso',
            data: {
                id: result.insertId,
                aluno: aluno.nome,
                livro: livro.titulo,
                dataEmprestimo,
                dataDevolucaoPrevista: dataDevolucaoPrevistaStr
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

        // Verificar se empréstimo existe
        const emprestimo = await Emprestimo.buscarPorId(idEmprestimo);
        if (!emprestimo) {
            return res.status(404).json({
                success: false,
                error: 'Empréstimo não encontrado'
            });
        }

        // Verificar se já foi devolvido
        if (emprestimo.dataDevolucaoReal) {
            return res.status(400).json({
                success: false,
                error: 'Livro já devolvido'
            });
        }

        // Registrar devolução
        const dataDevolucaoReal = new Date().toISOString().split('T')[0];
        await Emprestimo.registrarDevolucao(idEmprestimo, dataDevolucaoReal);

        // Atualizar classificação do aluno
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

        // Verificar se aluno existe
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