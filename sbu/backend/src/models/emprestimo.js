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
            `SELECT emp.*, a.nome as aluno_nome, a.ra,
                    l.titulo as livro_titulo, l.isbn, l.autor, l.editora, l.anoPublicacao,
                    ex.id as idExemplar, ex.codigo as exemplar_codigo
             FROM emprestimo emp
             JOIN aluno a ON emp.idAluno = a.id
             JOIN exemplar ex ON emp.idExemplar = ex.id
             JOIN livro l ON ex.idLivro = l.id
             WHERE emp.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async listarAtivosPorAluno(idAluno) {
        const [rows] = await connection.execute(
            `SELECT emp.*, l.titulo as livro_titulo, l.isbn, l.autor, l.editora, l.anoPublicacao,
                    ex.codigo as exemplar_codigo
             FROM emprestimo emp
             JOIN exemplar ex ON emp.idExemplar = ex.id
             JOIN livro l ON ex.idLivro = l.id
             WHERE emp.idAluno = ? AND emp.dataDevolucaoReal IS NULL`,
            [idAluno]
        );
        return rows;
    }

    static async listarTodosPorAluno(idAluno) {
        const [rows] = await connection.execute(
            `SELECT emp.*, l.titulo as livro_titulo, l.isbn, l.autor, l.editora, l.anoPublicacao,
                    ex.codigo as exemplar_codigo
             FROM emprestimo emp
             JOIN exemplar ex ON emp.idExemplar = ex.id
             JOIN livro l ON ex.idLivro = l.id
             WHERE emp.idAluno = ?`,
            [idAluno]
        );
        return rows;
    }

    static async listarEmprestimosAtivos() {
        const [rows] = await connection.execute(
            `SELECT emp.*, a.nome as aluno_nome, a.ra,
                    l.titulo as livro_titulo, l.autor, l.editora,
                    ex.codigo as exemplar_codigo
             FROM emprestimo emp
             JOIN aluno a ON emp.idAluno = a.id
             JOIN exemplar ex ON emp.idExemplar = ex.id
             JOIN livro l ON ex.idLivro = l.id
             WHERE emp.dataDevolucaoReal IS NULL`
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
        // Há pelo menos um exemplar disponível para este livro?
        const [rows] = await connection.execute(
            `SELECT id FROM exemplar WHERE idLivro = ? AND status = 'disponivel' LIMIT 1`,
            [idLivro]
        );
        return rows.length > 0;
    }
}

module.exports = Emprestimo;