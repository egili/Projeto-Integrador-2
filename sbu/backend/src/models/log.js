const { connection } = require('../database/connection');

class Log {
    static async registrar(tipo, descricao) {
        const [result] = await connection.execute(
            'INSERT INTO log (tipo, descricao) VALUES (?, ?)',
            [tipo, descricao]
        );
        return result;
    }
}

module.exports = Log;
