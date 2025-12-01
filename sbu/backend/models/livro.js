const { connection } = require('../database/connection');

class Livro {
    static async criar(dados) {
        const { titulo, isbn, autor, editora, anoPublicacao, categoria } = dados;
        const [result] = await connection.execute(
            'INSERT INTO livro (titulo, isbn, autor, editora, anoPublicacao, categoria) VALUES (?, ?, ?, ?, ?, ?)',
            [titulo, isbn || null, autor, editora, anoPublicacao, categoria || null]
        );
        return result;
    }

    static async listarTodos() {
        const [rows] = await connection.execute(`
            SELECT 
                l.*,
                COUNT(CASE WHEN e.status = 'disponivel' THEN 1 END) as exemplares_disponiveis,
                COUNT(e.id) as total_exemplares
            FROM livro l
            LEFT JOIN exemplar e ON l.id = e.idLivro
            GROUP BY l.id
            ORDER BY l.titulo
        `);
        return rows;
    }

    static async atualizar(id, dados) {
        const { titulo, isbn, autor, editora, anoPublicacao, categoria } = dados;
        const [result] = await connection.execute(
            `UPDATE livro 
             SET titulo = ?, isbn = ?, autor = ?, editora = ?, anoPublicacao = ?, categoria = ?
             WHERE id = ?`,
            [titulo, isbn || null, autor, editora, anoPublicacao, categoria || null, id]
        );
        return result;
    }

    static async remover(id) {
        await connection.execute('DELETE FROM exemplar WHERE idLivro = ?', [id]);
        
        const [result] = await connection.execute('DELETE FROM livro WHERE id = ?', [id]);
        return result;
    }

    static async listarDisponiveis() {
        const [rows] = await connection.execute(`
            SELECT 
                l.*,
                COUNT(CASE WHEN e.status = 'disponivel' THEN 1 END) as exemplares_disponiveis,
                COUNT(e.id) as total_exemplares
            FROM livro l
            LEFT JOIN exemplar e ON l.id = e.idLivro
            GROUP BY l.id
            HAVING exemplares_disponiveis > 0
            ORDER BY l.titulo
        `);
        return rows;
    }

    static async buscarPorTitulo(titulo) {
        const [rows] = await connection.execute(`
            SELECT 
                l.*,
                COUNT(CASE WHEN e.status = 'disponivel' THEN 1 END) as exemplares_disponiveis,
                COUNT(e.id) as total_exemplares
            FROM livro l
            LEFT JOIN exemplar e ON l.id = e.idLivro
            WHERE l.titulo LIKE ?
            GROUP BY l.id
        `, [`%${titulo}%`]);
        return rows;
    }

    static async buscarPorAutor(autor) {
        const [rows] = await connection.execute(`
            SELECT 
                l.*,
                COUNT(CASE WHEN e.status = 'disponivel' THEN 1 END) as exemplares_disponiveis,
                COUNT(e.id) as total_exemplares
            FROM livro l
            LEFT JOIN exemplar e ON l.id = e.idLivro
            WHERE l.autor LIKE ?
            GROUP BY l.id
        `, [`%${autor}%`]);
        return rows;
    }

    static async buscarPorTermo(termo) {
        const parametro = `%${termo}%`;
        const [rows] = await connection.execute(`
            SELECT 
                l.*,
                COUNT(CASE WHEN e.status = 'disponivel' THEN 1 END) as exemplares_disponiveis,
                COUNT(e.id) as total_exemplares
            FROM livro l
            LEFT JOIN exemplar e ON l.id = e.idLivro
            WHERE l.titulo LIKE ? OR l.autor LIKE ? OR l.categoria LIKE ?
            GROUP BY l.id
            ORDER BY l.titulo
        `, [parametro, parametro, parametro]);
        return rows;
    }

    static async buscarPorId(id) {
        const [rows] = await connection.execute(`
            SELECT 
                l.*,
                COUNT(CASE WHEN e.status = 'disponivel' THEN 1 END) as exemplares_disponiveis,
                COUNT(e.id) as total_exemplares
            FROM livro l
            LEFT JOIN exemplar e ON l.id = e.idLivro
            WHERE l.id = ?
            GROUP BY l.id
        `, [id]);
        return rows[0];
    }
}

module.exports = Livro;
