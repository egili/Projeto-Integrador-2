const { connection } = require('../database/connection');

class Aluno {
    static async criar(dados) {
        const { nome, ra } = dados;
        const [result] = await connection.execute(
            'INSERT INTO aluno (nome, ra) VALUES (?, ?)',
            [nome, ra]
        );
        return result;
    }

    static async buscarPorRa(ra) {
        const [rows] = await connection.execute(
            'SELECT * FROM aluno WHERE ra = ?',
            [ra]
        );
        return rows[0];
    }

    static async listar() {
        const [rows] = await connection.execute(
            'SELECT * FROM aluno ORDER BY nome'
        );
        return rows;
    }
}

module.exports = Aluno;
