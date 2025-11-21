const Aluno = require('../models/aluno');
const Emprestimo = require('../models/emprestimo');
const { connection } = require('../database/connection');

async function listarClassificacaoGeral(req, res) {
    try {
        const alunos = await Aluno.listar();

        const alunosComPontuacao = await Promise.all(alunos.map(async (aluno) => {
            // Considerando livros efetivamente devolvidos como "lidos"
            const emprestimos = await Emprestimo.listarPorAluno(aluno.id);
            const livrosLidos = emprestimos.filter(e => e.dataDevolucaoReal !== null).length;

            return {
                id: aluno.id,
                nome: aluno.nome,
                livrosLidos
            };
        }));

        res.json({ aluno: alunosComPontuacao });

    } catch (error) {
        console.error('Erro no listarClassificacaoGeral:', error);
        res.status(500).json({ success: false, error: "Erro ao obter classificação geral" });
    }
}

async function obterClassificacaoAluno(req, res) {
    try {
        const { ra } = req.params;

        // Buscar aluno
        const aluno = await Aluno.buscarPorRa(ra);
        if (!aluno) {
            return res.status(404).json({
                success: false,
                error: 'Aluno não encontrado'
            });
        }

        // Buscar todos os empréstimos do aluno
        const emprestimos = await Emprestimo.listarPorAluno(aluno.id);
        
        // Calcular estatísticas
        const livrosDevolvidos = emprestimos.filter(e => e.dataDevolucaoReal !== null);
        const livrosEmAndamento = emprestimos.filter(e => e.dataDevolucaoReal === null);
        const totalEmprestimos = emprestimos.length;
        
        // Determinar classificação baseado em livros devolvidos (lidos)
        const livrosLidos = livrosDevolvidos.length;
        let classificacao = 'Leitor Iniciante';
        
        if (livrosLidos > 20) {
            classificacao = 'Leitor Extremo';
        } else if (livrosLidos > 10) {
            classificacao = 'Leitor Ativo';
        } else if (livrosLidos > 5) {
            classificacao = 'Leitor Regular';
        }

        // Buscar últimas datas
        const ultimaDevolucao = livrosDevolvidos.length > 0 
            ? livrosDevolvidos.sort((a, b) => new Date(b.dataDevolucaoReal) - new Date(a.dataDevolucaoReal))[0].dataDevolucaoReal
            : null;
        
        const ultimoEmprestimo = emprestimos.length > 0
            ? emprestimos.sort((a, b) => new Date(b.dataEmprestimo) - new Date(a.dataEmprestimo))[0].dataEmprestimo
            : null;

        res.json({
            success: true,
            data: {
                aluno: {
                    id: aluno.id,
                    nome: aluno.nome,
                    ra: aluno.ra
                },
                estatisticas: {
                    livros_devolvidos: livrosLidos,
                    livros_em_andamento: livrosEmAndamento.length,
                    total_emprestimos: totalEmprestimos,
                    classificacao: classificacao,
                    ultima_devolucao: ultimaDevolucao,
                    ultimo_emprestimo: ultimoEmprestimo
                }
            }
        });

    } catch (error) {
        console.error('Erro ao obter classificação do aluno:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao obter classificação do aluno'
        });
    }
}

module.exports = { listarClassificacaoGeral, obterClassificacaoAluno };
