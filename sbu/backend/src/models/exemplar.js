const { connection } = require('../database/connection');

class Exemplar {
    static async criar(exemplar) {
        const { idLivro, codigo, status = 'disponivel', observacoes } = exemplar;
        const [result] = await connection.execute(
            'INSERT INTO exemplar (idLivro, codigo, status, observacoes) VALUES (?, ?, ?, ?)',
            [idLivro, codigo, status, observacoes]
        );
        return result;
    }

    static async buscarPorId(id) {
        const [rows] = await connection.execute(
            `SELECT e.*, l.titulo, l.autor, l.editora, l.anoPublicacao, l.isbn
             FROM exemplar e
             JOIN livro l ON e.idLivro = l.id
             WHERE e.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async buscarPorCodigo(codigo) {
        const [rows] = await connection.execute(
            `SELECT e.*, l.titulo, l.autor, l.editora, l.anoPublicacao, l.isbn
             FROM exemplar e
             JOIN livro l ON e.idLivro = l.id
             WHERE e.codigo = ?`,
            [codigo]
        );
        return rows[0];
    }

    static async listarPorLivro(idLivro) {
        const [rows] = await connection.execute(
            'SELECT * FROM exemplar WHERE idLivro = ?',
            [idLivro]
        );
        return rows;
    }

    static async listarDisponiveis() {
        const [rows] = await connection.execute(
            `SELECT e.*, l.titulo, l.autor, l.editora, l.anoPublicacao, l.isbn
             FROM exemplar e
             JOIN livro l ON e.idLivro = l.id
             WHERE e.status = 'disponivel'`
        );
        return rows;
    }

    static async listarTodos() {
        const [rows] = await connection.execute(
            `SELECT e.*, l.titulo, l.autor, l.editora, l.anoPublicacao, l.isbn
             FROM exemplar e
             JOIN livro l ON e.idLivro = l.id`
        );
        return rows;
    }

    static async atualizarStatus(id, status) {
        const [result] = await connection.execute(
            'UPDATE exemplar SET status = ? WHERE id = ?',
            [status, id]
        );
        return result;
    }

    static async atualizar(id, exemplar) {
        const { idLivro, codigo, status, observacoes } = exemplar;
        const [result] = await connection.execute(
            'UPDATE exemplar SET idLivro = ?, codigo = ?, status = ?, observacoes = ? WHERE id = ?',
            [idLivro, codigo, status, observacoes, id]
        );
        return result;
    }

    static async deletar(id) {
        const [result] = await connection.execute(
            'DELETE FROM exemplar WHERE id = ?',
            [id]
        );
        return result;
    }

    static async verificarDisponibilidade(id) {
        const [rows] = await connection.execute(
            'SELECT status FROM exemplar WHERE id = ?',
            [id]
        );
        return rows[0]?.status === 'disponivel';
    }
}

module.exports = Exemplar;