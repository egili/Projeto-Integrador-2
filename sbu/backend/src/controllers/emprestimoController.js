const Emprestimo = require('../models/emprestimo');
const Aluno = require('../models/aluno');
const Livro = require('../models/livro');
const Exemplar = require('../models/exemplar');
const Classificacao = require('../models/classificacao');
const Semestre = require('../models/semestre');
const { logSuccess, logError } = require('../middleware/logging');

exports.realizarEmprestimo = async (req, res) => {
    try {
        const { raAluno, idExemplar } = req.body;

        // Verificar se aluno existe
        const aluno = await Aluno.buscarPorRa(raAluno);
        if (!aluno) {
            return res.status(404).json({
                success: false,
                error: 'Aluno não encontrado'
            });
        }

        // Verificar se exemplar existe
        const exemplar = await Exemplar.buscarPorId(idExemplar);
        if (!exemplar) {
            return res.status(404).json({
                success: false,
                error: 'Exemplar não encontrado'
            });
        }

        // Verificar se exemplar está disponível
        const exemplarDisponivel = await Exemplar.verificarDisponibilidade(idExemplar);
        if (!exemplarDisponivel) {
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

        // Registrar empréstimo
        const result = await Emprestimo.criar({
            idAluno: aluno.id,
            idExemplar,
            dataEmprestimo,
            dataDevolucaoPrevista: dataDevolucaoPrevistaStr
        });

        // Atualizar status do exemplar para emprestado
        await Exemplar.atualizarStatus(idExemplar, 'emprestado');

        // Log de sucesso
        await logSuccess('Empréstimo realizado', `Aluno: ${aluno.nome} (${raAluno}) - Exemplar: ${exemplar.codigo} - Livro: ${exemplar.livro_titulo}`);

        res.status(201).json({
            success: true,
            message: 'Empréstimo realizado com sucesso',
            data: {
                id: result.insertId,
                aluno: aluno.nome,
                exemplar: exemplar.codigo,
                livro: exemplar.livro_titulo,
                dataEmprestimo,
                dataDevolucaoPrevista: dataDevolucaoPrevistaStr
            }
        });

    } catch (error) {
        console.error('Erro ao realizar empréstimo:', error);
        await logError(error, `Tentativa de empréstimo - RA: ${req.body.raAluno}, Exemplar: ${req.body.idExemplar}`);
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

        // Atualizar status do exemplar para disponível
        await Exemplar.atualizarStatus(emprestimo.idExemplar, 'disponivel');

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

        // Log de sucesso
        await logSuccess('Devolução realizada', `Empréstimo ID: ${idEmprestimo} - Aluno: ${emprestimo.aluno_nome} - Exemplar: ${emprestimo.exemplar_codigo}`);

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
        await logError(error, `Tentativa de devolução - Empréstimo ID: ${req.body.idEmprestimo}`);
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

exports.realizarEmprestimoPorCodigo = async (req, res) => {
    try {
        const { raAluno, codigoExemplar } = req.body;

        // Verificar se aluno existe
        const aluno = await Aluno.buscarPorRa(raAluno);
        if (!aluno) {
            return res.status(404).json({
                success: false,
                error: 'Aluno não encontrado'
            });
        }

        // Verificar se exemplar existe
        const exemplar = await Exemplar.buscarPorCodigo(codigoExemplar);
        if (!exemplar) {
            return res.status(404).json({
                success: false,
                error: 'Exemplar não encontrado'
            });
        }

        // Verificar se exemplar está disponível
        const exemplarDisponivel = await Exemplar.verificarDisponibilidade(exemplar.id);
        if (!exemplarDisponivel) {
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

        // Registrar empréstimo
        const result = await Emprestimo.criar({
            idAluno: aluno.id,
            idExemplar: exemplar.id,
            dataEmprestimo,
            dataDevolucaoPrevista: dataDevolucaoPrevistaStr
        });

        // Atualizar status do exemplar para emprestado
        await Exemplar.atualizarStatus(exemplar.id, 'emprestado');

        res.status(201).json({
            success: true,
            message: 'Empréstimo realizado com sucesso',
            data: {
                id: result.insertId,
                aluno: aluno.nome,
                exemplar: exemplar.codigo,
                livro: exemplar.livro_titulo,
                dataEmprestimo,
                dataDevolucaoPrevista: dataDevolucaoPrevistaStr
            }
        });

    } catch (error) {
        console.error('Erro ao realizar empréstimo por código:', error);
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