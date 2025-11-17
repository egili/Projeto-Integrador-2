const Aluno = require('../models/aluno');
const Emprestimo = require('../models/emprestimo');

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

module.exports = { listarClassificacaoGeral };
