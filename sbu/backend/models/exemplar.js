const { connection } = require('../database/connection');

class Exemplar {
    // Criar um exemplar único
    static async criar(dados) {
        const { idLivro, status } = dados;
        const [result] = await connection.execute(
            'INSERT INTO exemplar (idLivro, status) VALUES (?, ?)',
            [idLivro, status || 'disponivel']
        );
        return result;
    }

    // Criar múltiplos exemplares
    static async criarMultiplos(idLivro, quantidade) {
    if (quantidade <= 0) {
        return { totalCriados: 0, totalErros: 0, exemplares: [] };
    }

    const values = [];
    const placeholders = [];
    
    // 1. Constrói a lista de valores e placeholders
    for (let i = 0; i < quantidade; i++) {
        placeholders.push('(?, ?)'); // Cada par representa (idLivro, status)
        values.push(idLivro, 'disponivel');
    }

    const query = `INSERT INTO exemplar (idLivro, status) VALUES ${placeholders.join(', ')}`;

    try {
        // 2. Executa UMA ÚNICA consulta no DB
        const [result] = await connection.execute(query, values);
        
        // Retorna o resultado com base no número de linhas afetadas
        return { 
            totalCriados: result.affectedRows, 
            totalErros: 0, 
            exemplares: [] // Não podemos obter os IDs inseridos em massa facilmente, mas a contagem é precisa.
        };
    } catch (error) {
        console.error("Erro ao criar múltiplos exemplares:", error);
        return { 
            totalCriados: 0, 
            totalErros: quantidade, 
            erros: [error.message] 
        };
    }
}

    // Buscar exemplar por ID
    static async buscarPorId(id) {
        const [rows] = await connection.execute(
            'SELECT * FROM exemplar WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    // Listar todos os exemplares de um livro
    static async listarPorLivro(idLivro) {
        const [rows] = await connection.execute(
            'SELECT * FROM exemplar WHERE idLivro = ? ORDER BY id',
            [idLivro]
        );
        return rows;
    }

    // Listar apenas exemplares disponíveis de um livro
    static async listarDisponiveisPorLivro(idLivro) {
        const [rows] = await connection.execute(
            'SELECT * FROM exemplar WHERE idLivro = ? AND status = "disponivel" ORDER BY id',
            [idLivro]
        );
        return rows;
    }

    // Atualizar status de um exemplar
    static async atualizarStatus(id, novoStatus) {
        const [result] = await connection.execute(
            'UPDATE exemplar SET status = ? WHERE id = ?',
            [novoStatus, id]
        );
        return result;
    }

    // Atualizar dados de um exemplar (atualmente só status)
    static async atualizar(id, dados) {
        const { status } = dados;
        const [result] = await connection.execute(
            'UPDATE exemplar SET status = ? WHERE id = ?',
            [status, id]
        );
        return result;
    }

    // Deletar exemplar
    static async deletar(id) {
        const [result] = await connection.execute(
            'DELETE FROM exemplar WHERE id = ?',
            [id]
        );
        return result;
    }

    // Contar total de exemplares de um livro
    static async contarPorLivro(idLivro) {
        const [rows] = await connection.execute(
            'SELECT COUNT(*) as total FROM exemplar WHERE idLivro = ?',
            [idLivro]
        );
        return rows[0].total;
    }

    // Contar apenas exemplares disponíveis de um livro
    static async contarDisponiveisPorLivro(idLivro) {
        const [rows] = await connection.execute(
            'SELECT COUNT(*) as total FROM exemplar WHERE idLivro = ? AND status = "disponivel"',
            [idLivro]
        );
        return rows[0].total;
    }
}

module.exports = Exemplar;
