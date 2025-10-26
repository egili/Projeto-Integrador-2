const { connection } = require('../database/connection');

class Classificacao {
    static async criar(classificacao) {
        const { codigo, descricao, idSemestre, idAluno } = classificacao;
        const [result] = await connection.execute(
            'INSERT INTO classificacao (codigo, descricao, idSemestre, idAluno) VALUES (?, ?, ?, ?)',
            [codigo, descricao, idSemestre, idAluno]
        );
        return result;
    }

    static async buscarPorAlunoESemestre(idAluno, idSemestre) {
        const [rows] = await connection.execute(
            'SELECT * FROM classificacao WHERE idAluno = ? AND idSemestre = ?',
            [idAluno, idSemestre]
        );
        return rows[0];
    }

    static async listarPorSemestre(idSemestre) {
        // Busca todos os alunos e calcula classificação dinamicamente
        const [rows] = await connection.execute(
            `SELECT 
                a.id,
                a.nome,
                a.ra,
                COUNT(CASE WHEN e.dataDevolucaoReal IS NOT NULL THEN 1 END) as livros_lidos
            FROM aluno a
            LEFT JOIN emprestimo e ON a.id = e.idAluno 
                AND e.dataEmprestimo BETWEEN 
                    (SELECT dataInicio FROM semestre WHERE id = ?) 
                    AND (SELECT dataFim FROM semestre WHERE id = ?)
            GROUP BY a.id, a.nome, a.ra
            ORDER BY livros_lidos DESC, a.nome`,
            [idSemestre, idSemestre]
        );
        
        // Adiciona classificação para cada aluno
        return rows.map(aluno => {
            const livrosLidos = aluno.livros_lidos || 0;
            let classificacao;
            
            if (livrosLidos <= 5) {
                classificacao = 'Leitor Iniciante';
            } else if (livrosLidos <= 10) {
                classificacao = 'Leitor Regular';
            } else if (livrosLidos <= 20) {
                classificacao = 'Leitor Ativo';
            } else {
                classificacao = 'Leitor Extremo';
            }
            
            return {
                ...aluno,
                classificacao,
                livros_lidos: livrosLidos
            };
        });
    }

    static async atualizarClassificacaoAluno(idAluno, idSemestre, codigo, descricao) {
        // Remove classificação existente se houver
        await connection.execute(
            'DELETE FROM classificacao WHERE idAluno = ? AND idSemestre = ?',
            [idAluno, idSemestre]
        );

        // Insere nova classificação
        const [result] = await connection.execute(
            'INSERT INTO classificacao (codigo, descricao, idSemestre, idAluno) VALUES (?, ?, ?, ?)',
            [codigo, descricao, idSemestre, idAluno]
        );
        return result;
    }

    static async calcularClassificacao(idAluno, idSemestre) {
        // Conta livros lidos no semestre
        const [rows] = await connection.execute(
            `SELECT COUNT(*) as total_livros
                FROM emprestimo e
                WHERE e.idAluno = ? 
                AND e.dataEmprestimo BETWEEN 
                    (SELECT dataInicio FROM semestre WHERE id = ?) 
                    AND (SELECT dataFim FROM semestre WHERE id = ?)
                AND e.dataDevolucaoReal IS NOT NULL`,
            [idAluno, idSemestre, idSemestre]
        );

        const totalLivros = rows[0].total_livros;
        let codigo, descricao;

        if (totalLivros <= 5) {
            codigo = 'INICIANTE';
            descricao = 'Leitor Iniciante';
        } else if (totalLivros <= 10) {
            codigo = 'REGULAR';
            descricao = 'Leitor Regular';
        } else if (totalLivros <= 20) {
            codigo = 'ATIVO';
            descricao = 'Leitor Ativo';
        } else {
            codigo = 'EXTREMO';
            descricao = 'Leitor Extremo';
        }

        return { codigo, descricao, totalLivros };
    }
}

module.exports = Classificacao;