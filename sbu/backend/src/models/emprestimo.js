const { connection } = require('../database/connection');

class Emprestimo {
    static async criar(emprestimo) {
        const { idAluno, idLivro, dataEmprestimo, dataDevolucaoPrevista } = emprestimo;
        const [result] = await connection.execute(
            'INSERT INTO emprestimo (idAluno, idLivro, dataEmprestimo, dataDevolucaoPrevista) VALUES (?, ?, ?, ?)',
            [idAluno, idLivro, dataEmprestimo, dataDevolucaoPrevista]
        );
        return result;
    }

    static async buscarPorId(id) {
        const [rows] = await connection.execute(
            `SELECT e.*, a.nome as aluno_nome, a.ra, 
                    l.titulo as livro_titulo, l.isbn, l.autor, l.editora, l.anoPublicacao
             FROM emprestimo e
             JOIN aluno a ON e.idAluno = a.id
             JOIN livro l ON e.idLivro = l.id
             WHERE e.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async listarAtivosPorAluno(idAluno) {
        const [rows] = await connection.execute(
            `SELECT e.*, l.titulo as livro_titulo, l.isbn, l.autor, l.editora, l.anoPublicacao
             FROM emprestimo e
             JOIN livro l ON e.idLivro = l.id
             WHERE e.idAluno = ? AND e.dataDevolucaoReal IS NULL`,
            [idAluno]
        );
        return rows;
    }

    static async listarTodosPorAluno(idAluno) {
        const [rows] = await connection.execute(
            `SELECT e.*, l.titulo as livro_titulo, l.isbn, l.autor, l.editora, l.anoPublicacao
             FROM emprestimo e
             JOIN livro l ON e.idLivro = l.id
             WHERE e.idAluno = ?`,
            [idAluno]
        );
        return rows;
    }

    static async listarEmprestimosAtivos() {
        const [rows] = await connection.execute(
            `SELECT e.*, a.nome as aluno_nome, a.ra, 
                    l.titulo as livro_titulo, l.autor, l.editora
             FROM emprestimo e
             JOIN aluno a ON e.idAluno = a.id
             JOIN livro l ON e.idLivro = l.id
             WHERE e.dataDevolucaoReal IS NULL`
        );
        return rows;
    }

    static async registrarDevolucao(idEmprestimo, dataDevolucaoReal) {
        const [result] = await connection.execute(
            'UPDATE emprestimo SET dataDevolucaoReal = ? WHERE id = ?',
            [dataDevolucaoReal, idEmprestimo]
        );
        return result;
    }

    static async verificarLivroDisponivel(idLivro) {
        const [rows] = await connection.execute(
            'SELECT * FROM emprestimo WHERE idLivro = ? AND dataDevolucaoReal IS NULL',
            [idLivro]
        );
        return rows.length === 0;
    }
}

module.exports = Emprestimo;