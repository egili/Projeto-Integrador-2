const { connection } = require('../database/connection');

class Exemplar {
    static async criar(exemplar) {
        const { idLivro, codigo, status, observacoes, data_aquisicao } = exemplar;
        const [result] = await connection.execute(
            'INSERT INTO exemplar (idLivro, codigo, status, observacoes, data_aquisicao) VALUES (?, ?, ?, ?, ?)',
            [idLivro, codigo, status || 'disponivel', observacoes || null, data_aquisicao || new Date().toISOString().split('T')[0]]
        );
        return result;
    }

    static async buscarPorId(id) {
        const [rows] = await connection.execute(
            `SELECT e.*, l.titulo, l.isbn, l.autor, l.editora, l.anoPublicacao
             FROM exemplar e
             JOIN livro l ON e.idLivro = l.id
             WHERE e.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async buscarPorCodigo(codigo) {
        const [rows] = await connection.execute(
            `SELECT e.*, l.titulo, l.isbn, l.autor, l.editora, l.anoPublicacao
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
            `SELECT e.*, l.titulo, l.isbn, l.autor, l.editora, l.anoPublicacao
             FROM exemplar e
             JOIN livro l ON e.idLivro = l.id
             WHERE e.status = 'disponivel'
             ORDER BY l.titulo, e.codigo`
        );
        return rows;
    }

    static async listarDisponiveisPorLivro(idLivro) {
        const [rows] = await connection.execute(
            'SELECT * FROM exemplar WHERE idLivro = ? AND status = "disponivel"',
            [idLivro]
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
        const { codigo, status, observacoes } = exemplar;
        const [result] = await connection.execute(
            'UPDATE exemplar SET codigo = ?, status = ?, observacoes = ? WHERE id = ?',
            [codigo, status, observacoes, id]
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

    static async contarDisponiveisPorLivro(idLivro) {
        const [rows] = await connection.execute(
            'SELECT COUNT(*) as total FROM exemplar WHERE idLivro = ? AND status = "disponivel"',
            [idLivro]
        );
        return rows[0].total;
    }

    static async contarTotalPorLivro(idLivro) {
        const [rows] = await connection.execute(
            'SELECT COUNT(*) as total FROM exemplar WHERE idLivro = ?',
            [idLivro]
        );
        return rows[0].total;
    }
}

module.exports = Exemplar;
