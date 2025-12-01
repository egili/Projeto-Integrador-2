const { connection } = require('../database/connection');

class Exemplar {
    static async criar(dados) {
        const { idLivro, status } = dados;
        const [result] = await connection.execute(
            'INSERT INTO exemplar (idLivro, status) VALUES (?, ?)',
            [idLivro, status || 'disponivel']
        );
        return result;
    }

    static async criarMultiplos(idLivro, quantidade) {
        if (quantidade <= 0) {
            return { totalCriados: 0, totalErros: 0, exemplares: [] };
        }

        const values = [];
        const placeholders = [];
        
        for (let i = 0; i < quantidade; i++) {
            placeholders.push('(?, ?)'); 
            values.push(idLivro, 'disponivel');
        }

        const query = `INSERT INTO exemplar (idLivro, status) VALUES ${placeholders.join(', ')}`;

        try {
            const [result] = await connection.execute(query, values);
            return { 
                totalCriados: result.affectedRows, 
                totalErros: 0, 
                exemplares: []
            };
        } catch (error) {
            console.error("Erro no cadastro de exemplares:", error);
            throw error;
        }
    }

    static async buscarPorId(id) {
        const [rows] = await connection.execute('SELECT * FROM exemplar WHERE id = ?', [id]);
        return rows[0];
    }

    static async listarPorLivro(idLivro) {
        const [rows] = await connection.execute('SELECT * FROM exemplar WHERE idLivro = ? ORDER BY id', [idLivro]);
        return rows;
    }

    static async listarDisponiveisPorLivro(idLivro) {
        const [rows] = await connection.execute('SELECT * FROM exemplar WHERE idLivro = ? AND status = "disponivel" ORDER BY id', [idLivro]);
        return rows;
    }

    static async atualizarStatus(id, novoStatus) {
        const [result] = await connection.execute('UPDATE exemplar SET status = ? WHERE id = ?', [novoStatus, id]);
        return result;
    }

    static async atualizar(id, dados) {
        const { status } = dados;
        const [result] = await connection.execute('UPDATE exemplar SET status = ? WHERE id = ?', [status, id]);
        return result;
    }

    static async deletar(id) {
        const [result] = await connection.execute('DELETE FROM exemplar WHERE id = ?', [id]);
        return result;
    }

    static async contarPorLivro(idLivro) {
        const [rows] = await connection.execute('SELECT COUNT(*) as total FROM exemplar WHERE idLivro = ?', [idLivro]);
        return rows[0].total;
    }

    static async contarDisponiveisPorLivro(idLivro) {
        const [rows] = await connection.execute('SELECT COUNT(*) as total FROM exemplar WHERE idLivro = ? AND status = "disponivel"', [idLivro]);
        return rows[0].total;
    }
}

module.exports = Exemplar;