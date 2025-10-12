const Classificacao = require('../models/classificacao');
const Semestre = require('../models/semestre');
const Aluno = require('../models/aluno');

exports.obterClassificacaoPorAluno = async (req, res) => {
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

        // Buscar semestre ativo
        const semestreAtivo = await Semestre.buscarAtivo();
        if (!semestreAtivo) {
            return res.status(404).json({
                success: false,
                error: 'Nenhum semestre ativo encontrado'
            });
        }

        // Buscar classificação existente ou calcular nova
        let classificacao = await Classificacao.buscarPorAlunoESemestre(aluno.id, semestreAtivo.id);
        
        if (!classificacao) {
            // Calcular classificação se não existir
            const novaClassificacao = await Classificacao.calcularClassificacao(aluno.id, semestreAtivo.id);
            classificacao = {
                codigo: novaClassificacao.codigo,
                descricao: novaClassificacao.descricao,
                totalLivros: novaClassificacao.totalLivros
            };
        }

        res.json({
            success: true,
            data: {
                aluno: aluno.nome,
                ra: aluno.ra,
                semestre: semestreAtivo.descricao,
                classificacao: classificacao.codigo,
                descricao: classificacao.descricao,
                totalLivros: classificacao.totalLivros || 0
            }
        });

    } catch (error) {
        console.error('Erro ao obter classificação:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.listarClassificacaoGeral = async (req, res) => {
    try {
        // Buscar semestre ativo
        const semestreAtivo = await Semestre.buscarAtivo();
        if (!semestreAtivo) {
            return res.status(404).json({
                success: false,
                error: 'Nenhum semestre ativo encontrado'
            });
        }

        const classificacoes = await Classificacao.listarPorSemestre(semestreAtivo.id);

        res.json({
            success: true,
            data: classificacoes,
            semestre: semestreAtivo.descricao,
            total: classificacoes.length
        });

    } catch (error) {
        console.error('Erro ao listar classificação geral:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};