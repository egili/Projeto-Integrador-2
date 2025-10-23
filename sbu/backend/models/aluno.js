const { connection } = require('../database/connection');

class Aluno {
    static async criar(aluno) {
        const { nome, ra } = aluno;
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

    static async buscarPorId(id) {
        const [rows] = await connection.execute(
            'SELECT * FROM aluno WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async listar() {
        const [rows] = await connection.execute('SELECT * FROM aluno');
        return rows;
    }

    static async atualizar(id, aluno) {
        const { nome, ra } = aluno;
        const [result] = await connection.execute(
            'UPDATE aluno SET nome = ?, ra = ? WHERE id = ?',
            [nome, ra, id]
        );
        return result;
    }

    static async deletar(id) {
        const [result] = await connection.execute(
            'DELETE FROM aluno WHERE id = ?',
            [id]
        );
        return result;
    }
}

module.exports = Aluno; 