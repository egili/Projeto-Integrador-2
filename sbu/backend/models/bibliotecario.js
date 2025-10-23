const { connection } = require('../database/connection');

class Bibliotecario {
    static async criar(bibliotecario) {
        const { nome } = bibliotecario;
        const [result] = await connection.execute(
            'INSERT INTO bibliotecario (nome) VALUES (?)',
            [nome]
        );
        return result;
    }

    static async buscarPorId(id) {
        const [rows] = await connection.execute(
            'SELECT * FROM bibliotecario WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async listar() {
        const [rows] = await connection.execute('SELECT * FROM bibliotecario');
        return rows;
    }
}

module.exports = Bibliotecario;