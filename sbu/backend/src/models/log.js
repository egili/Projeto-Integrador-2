const { connection } = require('../database/connection');

class Log {
    static async criar(tipo, descricao) {
        const [result] = await connection.execute(
            'INSERT INTO log (tipo, descricao) VALUES (?, ?)',
            [tipo, descricao]
        );
        return result;
    }

    static async listar(filtros = {}) {
        let query = 'SELECT * FROM log';
        const params = [];
        const conditions = [];

        if (filtros.tipo) {
            conditions.push('tipo = ?');
            params.push(filtros.tipo);
        }

        if (filtros.dataInicio) {
            conditions.push('DATE(dataHora) >= ?');
            params.push(filtros.dataInicio);
        }

        if (filtros.dataFim) {
            conditions.push('DATE(dataHora) <= ?');
            params.push(filtros.dataFim);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY dataHora DESC';

        if (filtros.limit) {
            query += ' LIMIT ?';
            params.push(filtros.limit);
        }

        const [rows] = await connection.execute(query, params);
        return rows;
    }

    static async listarPorTipo(tipo, limit = 100) {
        const [rows] = await connection.execute(
            'SELECT * FROM log WHERE tipo = ? ORDER BY dataHora DESC LIMIT ?',
            [tipo, limit]
        );
        return rows;
    }

    static async listarRecentes(limit = 50) {
        const [rows] = await connection.execute(
            'SELECT * FROM log ORDER BY dataHora DESC LIMIT ?',
            [limit]
        );
        return rows;
    }

    static async contarPorTipo() {
        const [rows] = await connection.execute(
            'SELECT tipo, COUNT(*) as total FROM log GROUP BY tipo'
        );
        return rows;
    }
}

module.exports = Log;