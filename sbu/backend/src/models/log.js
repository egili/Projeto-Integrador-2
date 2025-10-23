const { connection } = require('../database/connection');

class Log {
    static async criar(log) {
        const { tipo, descricao } = log;
        const [result] = await connection.execute(
            'INSERT INTO log (tipo, descricao) VALUES (?, ?)',
            [tipo, descricao]
        );
        return result;
    }

    static async listar(limite = 100) {
        const [rows] = await connection.execute(
            'SELECT * FROM log ORDER BY dataHora DESC LIMIT ?',
            [limite]
        );
        return rows;
    }

    static async listarPorTipo(tipo, limite = 100) {
        const [rows] = await connection.execute(
            'SELECT * FROM log WHERE tipo = ? ORDER BY dataHora DESC LIMIT ?',
            [tipo, limite]
        );
        return rows;
    }

    static async buscarPorId(id) {
        const [rows] = await connection.execute(
            'SELECT * FROM log WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async deletar(id) {
        const [result] = await connection.execute(
            'DELETE FROM log WHERE id = ?',
            [id]
        );
        return result;
    }

    // Métodos de conveniência
    static async logSucesso(descricao) {
        return this.criar({ tipo: 'sucesso', descricao });
    }

    static async logErro(descricao) {
        return this.criar({ tipo: 'erro', descricao });
    }

    static async logExcecao(descricao) {
        return this.criar({ tipo: 'excecao', descricao });
    }
}

module.exports = Log;