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
        const exemplares = [];
        const erros = [];
        
        for (let i = 1; i <= quantidade; i++) {
            try {
                const result = await Exemplar.criar({
                    idLivro,
                    status: 'disponivel'
                });
                exemplares.push({
                    id: result.insertId,
                    status: 'disponivel'
                });
            } catch (error) {
                erros.push({
                    indice: i,
                    erro: error.message
                });
            }
        }
        
        return {
            exemplares,
            totalCriados: exemplares.length,
            totalErros: erros.length,
            erros
        };
    }

    static async buscarPorId(id) {
        const [rows] = await connection.execute(
            'SELECT * FROM exemplar WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async listarPorLivro(idLivro) {
        const [rows] = await connection.execute(
            'SELECT * FROM exemplar WHERE idLivro = ? ORDER BY id',
            [idLivro]
        );
        return rows;
    }

    static async listarDisponiveisPorLivro(idLivro) {
        const [rows] = await connection.execute(
            'SELECT * FROM exemplar WHERE idLivro = ? AND status = "disponivel" ORDER BY id',
            [idLivro]
        );
        return rows;
    }

    static async atualizarStatus(id, novoStatus) {
        const [result] = await connection.execute(
            'UPDATE exemplar SET status = ? WHERE id = ?',
            [novoStatus, id]
        );
        return result;
    }

    static async atualizar(id, dados) {
        const { status } = dados;
        const [result] = await connection.execute(
            'UPDATE exemplar SET status = ? WHERE id = ?',
            [status, id]
        );
        return result;
    }

    static async deletar(id) {
        const [result] = await connection.execute(
            'DELETE FROM exemplar WHERE id = ?',
            [id]
        );
        return result;
    }

    static async contarPorLivro(idLivro) {
        const [rows] = await connection.execute(
            'SELECT COUNT(*) as total FROM exemplar WHERE idLivro = ?',
            [idLivro]
        );
        return rows[0].total;
    }

    static async contarDisponiveisPorLivro(idLivro) {
        const [rows] = await connection.execute(
            'SELECT COUNT(*) as total FROM exemplar WHERE idLivro = ? AND status = "disponivel"',
            [idLivro]
        );
        return rows[0].total;
    }
}

module.exports = Exemplar;
