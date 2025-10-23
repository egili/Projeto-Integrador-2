const { connection } = require('../database/connection');

class Exemplar {
    static async criar(exemplar) {
        const { idLivro, codigo, status = 'disponivel', observacoes, data_aquisicao } = exemplar;
        const [result] = await connection.execute(
            'INSERT INTO exemplar (idLivro, codigo, status, observacoes, data_aquisicao) VALUES (?, ?, ?, ?, ?)',
            [idLivro, codigo, status, observacoes, data_aquisicao]
        );
        return result;
    }

    static async buscarPorId(id) {
        const [rows] = await connection.execute(
            `SELECT e.*, l.titulo as livro_titulo, l.isbn, l.autor, l.editora, l.anoPublicacao
             FROM exemplar e
             JOIN livro l ON e.idLivro = l.id
             WHERE e.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async buscarPorCodigo(codigo) {
        const [rows] = await connection.execute(
            `SELECT e.*, l.titulo as livro_titulo, l.isbn, l.autor, l.editora, l.anoPublicacao
             FROM exemplar e
             JOIN livro l ON e.idLivro = l.id
             WHERE e.codigo = ?`,
            [codigo]
        );
        return rows[0];
    }

    static async listarPorLivro(idLivro) {
        const [rows] = await connection.execute(
            `SELECT e.*, l.titulo as livro_titulo, l.isbn, l.autor, l.editora, l.anoPublicacao
             FROM exemplar e
             JOIN livro l ON e.idLivro = l.id
             WHERE e.idLivro = ?
             ORDER BY e.codigo`,
            [idLivro]
        );
        return rows;
    }

    static async listarDisponiveis() {
        const [rows] = await connection.execute(
            `SELECT e.*, l.titulo as livro_titulo, l.isbn, l.autor, l.editora, l.anoPublicacao
             FROM exemplar e
             JOIN livro l ON e.idLivro = l.id
             WHERE e.status = 'disponivel'
             ORDER BY l.titulo, e.codigo`
        );
        return rows;
    }

    static async listarDisponiveisPorLivro(idLivro) {
        const [rows] = await connection.execute(
            `SELECT e.*, l.titulo as livro_titulo, l.isbn, l.autor, l.editora, l.anoPublicacao
             FROM exemplar e
             JOIN livro l ON e.idLivro = l.id
             WHERE e.idLivro = ? AND e.status = 'disponivel'
             ORDER BY e.codigo`,
            [idLivro]
        );
        return rows;
    }

    static async atualizarStatus(id, status, observacoes = null) {
        const [result] = await connection.execute(
            'UPDATE exemplar SET status = ?, observacoes = ? WHERE id = ?',
            [status, observacoes, id]
        );
        return result;
    }

    static async atualizar(id, dados) {
        const { codigo, status, observacoes, data_aquisicao } = dados;
        const [result] = await connection.execute(
            'UPDATE exemplar SET codigo = ?, status = ?, observacoes = ?, data_aquisicao = ? WHERE id = ?',
            [codigo, status, observacoes, data_aquisicao, id]
        );
        return result;
    }

    static async excluir(id) {
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
        return rows.length > 0 && rows[0].status === 'disponivel';
    }

    static async listarTodos() {
        const [rows] = await connection.execute(
            `SELECT e.*, l.titulo as livro_titulo, l.isbn, l.autor, l.editora, l.anoPublicacao
             FROM exemplar e
             JOIN livro l ON e.idLivro = l.id
             ORDER BY l.titulo, e.codigo`
        );
        return rows;
    }

    static async buscarPorStatus(status) {
        const [rows] = await connection.execute(
            `SELECT e.*, l.titulo as livro_titulo, l.isbn, l.autor, l.editora, l.anoPublicacao
             FROM exemplar e
             JOIN livro l ON e.idLivro = l.id
             WHERE e.status = ?
             ORDER BY l.titulo, e.codigo`,
            [status]
        );
        return rows;
    }
}

module.exports = Exemplar;