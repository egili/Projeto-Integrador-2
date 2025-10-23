const { connection } = require('../database/connection');

class Exemplar {
    static async criar(exemplar) {
        const { idLivro, codigo, status = 'disponivel', observacoes = null, data_aquisicao = null } = exemplar;
        const [result] = await connection.execute(
            'INSERT INTO exemplar (idLivro, codigo, status, observacoes, data_aquisicao) VALUES (?, ?, ?, ?, ?)',
            [idLivro, codigo, status, observacoes, data_aquisicao]
        );
        return result;
    }

    static async buscarPorId(id) {
        const [rows] = await connection.execute('SELECT * FROM exemplar WHERE id = ?', [id]);
        return rows[0];
    }

    static async listarPorLivro(idLivro) {
        const [rows] = await connection.execute('SELECT * FROM exemplar WHERE idLivro = ?', [idLivro]);
        return rows;
    }

    static async buscarDisponivelPorLivro(idLivro) {
        const [rows] = await connection.execute(
            `SELECT * FROM exemplar 
             WHERE idLivro = ? AND status = 'disponivel' 
             ORDER BY id ASC LIMIT 1`,
            [idLivro]
        );
        return rows[0];
    }

    static async atualizarStatus(idExemplar, status) {
        const [result] = await connection.execute(
            'UPDATE exemplar SET status = ? WHERE id = ?',
            [status, idExemplar]
        );
        return result;
    }
}

module.exports = Exemplar;
