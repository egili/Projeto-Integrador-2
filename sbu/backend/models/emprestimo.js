const { connection } = require('../database/connection');

class Emprestimo {
    static async listarPorAluno(idAluno) {
        const [rows] = await connection.execute(
            'SELECT * FROM emprestimo WHERE idAluno = ?',
            [idAluno]
        );
        return rows;
    }

    static async contarDevolvidos(idAluno) {
        const [rows] = await connection.execute(
            'SELECT COUNT(*) as total FROM emprestimo WHERE idAluno = ? AND dataDevolucaoReal IS NOT NULL',
            [idAluno]
        );
        return rows[0].total;
    }
}

module.exports = Emprestimo;
