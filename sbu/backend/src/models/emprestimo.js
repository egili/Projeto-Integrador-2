const { connection } = require('../database/connection');

class Emprestimo {
    static async criar(emprestimo) {
        const { idAluno, idExemplar, dataEmprestimo, dataDevolucaoPrevista } = emprestimo;
        const [result] = await connection.execute(
            'INSERT INTO emprestimo (idAluno, idExemplar, dataEmprestimo, dataDevolucaoPrevista) VALUES (?, ?, ?, ?)',
            [idAluno, idExemplar, dataEmprestimo, dataDevolucaoPrevista]
        );
        return result;
    }

    static async buscarPorId(id) {
        const [rows] = await connection.execute(
            `SELECT e.*, a.nome as aluno_nome, a.ra, 
                    ex.codigo as exemplar_codigo, ex.status as exemplar_status,
                    l.titulo as livro_titulo, l.isbn, l.autor, l.editora, l.anoPublicacao
             FROM emprestimo e
             JOIN aluno a ON e.idAluno = a.id
             JOIN exemplar ex ON e.idExemplar = ex.id
             JOIN livro l ON ex.idLivro = l.id
             WHERE e.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async listarAtivosPorAluno(idAluno) {
        const [rows] = await connection.execute(
            `SELECT e.*, ex.codigo as exemplar_codigo, 
                    l.titulo as livro_titulo, l.isbn, l.autor, l.editora, l.anoPublicacao
             FROM emprestimo e
             JOIN exemplar ex ON e.idExemplar = ex.id
             JOIN livro l ON ex.idLivro = l.id
             WHERE e.idAluno = ? AND e.dataDevolucaoReal IS NULL`,
            [idAluno]
        );
        return rows;
    }

    static async listarTodosPorAluno(idAluno) {
        const [rows] = await connection.execute(
            `SELECT e.*, ex.codigo as exemplar_codigo,
                    l.titulo as livro_titulo, l.isbn, l.autor, l.editora, l.anoPublicacao
             FROM emprestimo e
             JOIN exemplar ex ON e.idExemplar = ex.id
             JOIN livro l ON ex.idLivro = l.id
             WHERE e.idAluno = ?
             ORDER BY e.dataEmprestimo DESC`,
            [idAluno]
        );
        return rows;
    }

    static async listarEmprestimosAtivos() {
        const [rows] = await connection.execute(
            `SELECT e.*, a.nome as aluno_nome, a.ra, 
                    ex.codigo as exemplar_codigo,
                    l.titulo as livro_titulo, l.autor, l.editora
             FROM emprestimo e
             JOIN aluno a ON e.idAluno = a.id
             JOIN exemplar ex ON e.idExemplar = ex.id
             JOIN livro l ON ex.idLivro = l.id
             WHERE e.dataDevolucaoReal IS NULL
             ORDER BY e.dataEmprestimo DESC`
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

    static async verificarExemplarDisponivel(idExemplar) {
        const [rows] = await connection.execute(
            'SELECT * FROM emprestimo WHERE idExemplar = ? AND dataDevolucaoReal IS NULL',
            [idExemplar]
        );
        return rows.length === 0;
    }

    static async buscarPorExemplar(idExemplar) {
        const [rows] = await connection.execute(
            `SELECT e.*, a.nome as aluno_nome, a.ra 
             FROM emprestimo e
             JOIN aluno a ON e.idAluno = a.id
             WHERE e.idExemplar = ? AND e.dataDevolucaoReal IS NULL`,
            [idExemplar]
        );
        return rows[0];
    }
}

module.exports = Emprestimo;
