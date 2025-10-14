const { connection } = require('../database/connection');

class Semestre {
    static async criar(semestre) {
        const { descricao, dataInicio, dataFim } = semestre;
        const [result] = await connection.execute(
            'INSERT INTO semestre (descricao, dataInicio, dataFim) VALUES (?, ?, ?)',
            [descricao, dataInicio, dataFim]
        );
        return result;
    }

    static async buscarAtivo() {
        const [rows] = await connection.execute(
            'SELECT * FROM semestre WHERE dataInicio <= CURDATE() AND dataFim >= CURDATE() ORDER BY dataInicio DESC LIMIT 1'
        );
        return rows[0];
    }

    static async buscarPorId(id) {
        const [rows] = await connection.execute(
            'SELECT * FROM semestre WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async listar() {
        const [rows] = await connection.execute('SELECT * FROM semestre ORDER BY dataInicio DESC');
        return rows;
    }
}

module.exports = Semestre;