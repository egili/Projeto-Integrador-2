const { connection } = require('../database/connection');

function determinarClassificacao(livrosLidos) {
    const total = Number(livrosLidos) || 0;

    if (total > 20) {
        return {
            codigo: 'LEITOR_EXTREMO',
            descricao: 'Leitor Extremo',
            proximaMeta: null
        };
    }

    if (total > 10) {
        return {
            codigo: 'LEITOR_ATIVO',
            descricao: 'Leitor Ativo',
            proximaMeta: 21
        };
    }

    if (total > 5) {
        return {
            codigo: 'LEITOR_REGULAR',
            descricao: 'Leitor Regular',
            proximaMeta: 11
        };
    }

    return {
        codigo: 'LEITOR_INICIANTE',
        descricao: 'Leitor Iniciante',
        proximaMeta: 6
    };
}

exports.obterClassificacaoAluno = async (req, res) => {
    try {
        const { ra } = req.params;

        const [alunos] = await connection.execute(
            'SELECT id, nome, ra FROM aluno WHERE ra = ? LIMIT 1',
            [ra]
        );

        if (alunos.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Aluno não encontrado'
            });
        }

        const aluno = alunos[0];

        const [estatisticasRaw] = await connection.execute(
            `
            SELECT
                COUNT(*) AS total_emprestimos,
                SUM(CASE WHEN dataDevolucaoReal IS NOT NULL THEN 1 ELSE 0 END) AS livros_devolvidos,
                SUM(CASE WHEN dataDevolucaoReal IS NULL THEN 1 ELSE 0 END) AS livros_em_andamento,
                MAX(dataEmprestimo) AS ultimo_emprestimo,
                MAX(dataDevolucaoReal) AS ultima_devolucao
            FROM emprestimo
            WHERE idAluno = ?
            `,
            [aluno.id]
        );

        const estatisticas = estatisticasRaw[0] || {};
        const livrosDevolvidos = Number(estatisticas.livros_devolvidos) || 0;
        const classificacao = determinarClassificacao(livrosDevolvidos);

        res.json({
            success: true,
            data: {
                aluno: {
                    id: aluno.id,
                    nome: aluno.nome,
                    ra: aluno.ra
                },
                estatisticas: {
                    total_emprestimos: Number(estatisticas.total_emprestimos) || 0,
                    livros_devolvidos: livrosDevolvidos,
                    livros_em_andamento: Number(estatisticas.livros_em_andamento) || 0,
                    ultimo_emprestimo: estatisticas.ultimo_emprestimo,
                    ultima_devolucao: estatisticas.ultima_devolucao,
                    classificacao: classificacao.descricao,
                    classificacao_codigo: classificacao.codigo,
                    proxima_meta: classificacao.proximaMeta
                }
            }
        });
    } catch (error) {
        console.error('Erro ao obter classificação do aluno:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

exports.listarClassificacaoGeral = async (req, res) => {
    try {
        const limite = Math.max(
            1,
            Math.min(100, Number(req.query.limite || req.query.limit || 50))
        );

        const [rows] = await connection.execute(
            `
            SELECT
                a.id,
                a.nome,
                a.ra,
                COUNT(e.id) AS total_emprestimos,
                SUM(CASE WHEN e.dataDevolucaoReal IS NOT NULL THEN 1 ELSE 0 END) AS livros_devolvidos,
                SUM(CASE WHEN e.dataDevolucaoReal IS NULL THEN 1 ELSE 0 END) AS livros_em_andamento,
                MAX(e.dataDevolucaoReal) AS ultima_devolucao
            FROM aluno a
            LEFT JOIN emprestimo e ON e.idAluno = a.id
            GROUP BY a.id
            ORDER BY livros_devolvidos DESC, a.nome ASC
            `
        );

        const classificacaoGeral = rows
            .map((row) => {
                const livrosDevolvidos = Number(row.livros_devolvidos) || 0;
                const classificacao = determinarClassificacao(livrosDevolvidos);

                return {
                    id: row.id,
                    nome: row.nome,
                    ra: row.ra,
                    total_emprestimos: Number(row.total_emprestimos) || 0,
                    livros_devolvidos: livrosDevolvidos,
                    livros_em_andamento: Number(row.livros_em_andamento) || 0,
                    ultima_devolucao: row.ultima_devolucao,
                    classificacao: classificacao.descricao,
                    classificacao_codigo: classificacao.codigo
                };
            })
            .slice(0, limite);

        res.json({
            success: true,
            data: classificacaoGeral,
            total: classificacaoGeral.length
        });
    } catch (error) {
        console.error('Erro ao listar classificação geral:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

