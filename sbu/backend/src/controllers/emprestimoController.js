const Emprestimo = require('../models/emprestimo');
const Aluno = require('../models/aluno');
const Livro = require('../models/livro');
const Exemplar = require('../models/exemplar');
const Classificacao = require('../models/classificacao');
const Semestre = require('../models/semestre');
const Log = require('../models/log');

exports.realizarEmprestimo = async (req, res) => {
    try {
        const { raAluno, idExemplar } = req.body;

        // Verificar se aluno existe
        const aluno = await Aluno.buscarPorRa(raAluno);
        if (!aluno) {
            await Log.logErro(`Tentativa de empréstimo com RA inexistente: ${raAluno}`);
            return res.status(404).json({
                success: false,
                error: 'Aluno não encontrado'
            });
        }

        // Verificar se exemplar existe
        const exemplar = await Exemplar.buscarPorId(idExemplar);
        if (!exemplar) {
            await Log.logErro(`Tentativa de empréstimo com exemplar inexistente: ${idExemplar}`);
            return res.status(404).json({
                success: false,
                error: 'Exemplar não encontrado'
            });
        }

        // Verificar se exemplar está disponível
        const exemplarDisponivel = await Exemplar.verificarDisponibilidade(idExemplar);
        if (!exemplarDisponivel) {
            await Log.logErro(`Tentativa de empréstimo de exemplar indisponível: ${exemplar.codigo}`);
            return res.status(400).json({
                success: false,
                error: 'Exemplar não está disponível para empréstimo'
            });
        }

        // Calcular datas
        const dataEmprestimo = new Date().toISOString().split('T')[0];
        const dataDevolucaoPrevista = new Date();
        dataDevolucaoPrevista.setDate(dataDevolucaoPrevista.getDate() + 7);
        const dataDevolucaoPrevistaStr = dataDevolucaoPrevista.toISOString().split('T')[0];

        // Atualizar status do exemplar para emprestado
        await Exemplar.atualizarStatus(idExemplar, 'emprestado');

        // Registrar empréstimo
        const result = await Emprestimo.criar({
            idAluno: aluno.id,
            idExemplar,
            dataEmprestimo,
            dataDevolucaoPrevista: dataDevolucaoPrevistaStr
        });

        await Log.logSucesso(`Empréstimo realizado: ${aluno.nome} (${raAluno}) - ${exemplar.titulo} (${exemplar.codigo})`);

        res.status(201).json({
            success: true,
            message: 'Empréstimo realizado com sucesso',
            data: {
                id: result.insertId,
                aluno: aluno.nome,
                livro: exemplar.titulo,
                exemplar: exemplar.codigo,
                dataEmprestimo,
                dataDevolucaoPrevista: dataDevolucaoPrevistaStr
            }
        });

    } catch (error) {
        console.error('Erro ao realizar empréstimo:', error);
        await Log.logExcecao(`Erro ao realizar empréstimo: ${error.message}`);
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
            await Log.logErro(`Tentativa de devolução de empréstimo inexistente: ${idEmprestimo}`);
            return res.status(404).json({
                success: false,
                error: 'Empréstimo não encontrado'
            });
        }

        // Verificar se já foi devolvido
        if (emprestimo.dataDevolucaoReal) {
            await Log.logErro(`Tentativa de devolução de livro já devolvido: ${emprestimo.exemplar_codigo}`);
            return res.status(400).json({
                success: false,
                error: 'Livro já devolvido'
            });
        }

        // Registrar devolução
        const dataDevolucaoReal = new Date().toISOString().split('T')[0];
        await Emprestimo.registrarDevolucao(idEmprestimo, dataDevolucaoReal);

        // Atualizar status do exemplar para disponível
        await Exemplar.atualizarStatus(emprestimo.idExemplar, 'disponivel');

        // Atualizar classificação do aluno
        const semestreAtivo = await Semestre.buscarAtivo();
        let classificacao = null;
        if (semestreAtivo) {
            classificacao = await Classificacao.calcularClassificacao(
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

        await Log.logSucesso(`Devolução registrada: ${emprestimo.aluno_nome} - ${emprestimo.livro_titulo} (${emprestimo.exemplar_codigo})`);

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
        await Log.logExcecao(`Erro ao registrar devolução: ${error.message}`);
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