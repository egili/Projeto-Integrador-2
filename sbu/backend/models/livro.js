const { connection } = require('../database/connection');

class Livro {
    static async criar(livro) {
        const { titulo, isbn, autor, editora, anoPublicacao, categoria } = livro;
        const [result] = await connection.execute(
            'INSERT INTO livro (titulo, isbn, autor, editora, anoPublicacao, categoria) VALUES (?, ?, ?, ?, ?, ?)',
            [titulo, isbn, autor, editora, anoPublicacao, categoria || null]
        );
        return result;
    }

    static async buscarPorId(id) {
        const [rows] = await connection.execute(
            'SELECT * FROM livro WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async buscarPorIsbn(isbn) {
        const [rows] = await connection.execute(
            'SELECT * FROM livro WHERE isbn = ?',
            [isbn]
        );
        return rows[0];
    }

    static async listarDisponiveis() {
        const [rows] = await connection.execute(`
            SELECT 
                l.*,
                COUNT(CASE WHEN ex.status = 'disponivel' THEN 1 END) as exemplares_disponiveis,
                COUNT(ex.id) as total_exemplares
            FROM livro l
            LEFT JOIN exemplar ex ON l.id = ex.idLivro
            GROUP BY l.id
            HAVING exemplares_disponiveis > 0
        `);
        return rows;
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

    static async atualizar(id, livro) {
        const { titulo, isbn, autor, editora, anoPublicacao, categoria } = livro;
        const [result] = await connection.execute(
            'UPDATE livro SET titulo = ?, isbn = ?, autor = ?, editora = ?, anoPublicacao = ?, categoria = ? WHERE id = ?',
            [titulo, isbn, autor, editora, anoPublicacao, categoria || null, id]
        );
        return result;
    }

    static async deletar(id) {
        const [result] = await connection.execute(
            'DELETE FROM livro WHERE id = ?',
            [id]
        );
        return result;
    }
}

module.exports = Livro;