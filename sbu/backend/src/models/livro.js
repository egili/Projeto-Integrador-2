const { connection } = require('../database/connection');

class Livro {
    static async criar(livro) {
        const { titulo, isbn, autor, editora, anoPublicacao } = livro;
        const [result] = await connection.execute(
            'INSERT INTO livro (titulo, isbn, autor, editora, anoPublicacao) VALUES (?, ?, ?, ?, ?)',
            [titulo, isbn, autor, editora, anoPublicacao]
        );
        return result;
    }

    static async buscarPorId(id) {
        const [rows] = await connection.execute(
            `SELECT l.*,
                (SELECT COUNT(*) FROM exemplar ex WHERE ex.idLivro = l.id AND ex.status = 'disponivel') as exemplares_disponiveis,
                (SELECT COUNT(*) FROM exemplar ex WHERE ex.idLivro = l.id) as total_exemplares
            FROM livro l
            WHERE l.id = ?`,
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
            SELECT DISTINCT l.*,
                (SELECT COUNT(*) FROM exemplar ex WHERE ex.idLivro = l.id AND ex.status = 'disponivel') as exemplares_disponiveis,
                (SELECT COUNT(*) FROM exemplar ex WHERE ex.idLivro = l.id) as total_exemplares
            FROM livro l
            WHERE EXISTS (
                SELECT 1 FROM exemplar ex 
                WHERE ex.idLivro = l.id AND ex.status = 'disponivel'
            )
            ORDER BY l.titulo
        `);
        return rows;
    }

    static async listarTodos() {
        const [rows] = await connection.execute(`
            SELECT l.*,
                (SELECT COUNT(*) FROM exemplar ex WHERE ex.idLivro = l.id AND ex.status = 'disponivel') as exemplares_disponiveis,
                (SELECT COUNT(*) FROM exemplar ex WHERE ex.idLivro = l.id) as total_exemplares
            FROM livro l
            ORDER BY l.titulo
        `);
        return rows;
    }

    static async buscarPorTitulo(titulo) {
        const [rows] = await connection.execute(
            `SELECT l.*,
                (SELECT COUNT(*) FROM exemplar ex WHERE ex.idLivro = l.id AND ex.status = 'disponivel') as exemplares_disponiveis,
                (SELECT COUNT(*) FROM exemplar ex WHERE ex.idLivro = l.id) as total_exemplares
            FROM livro l
            WHERE l.titulo LIKE ?
            ORDER BY l.titulo`,
            [`%${titulo}%`]
        );
        return rows;
    }

    static async buscarPorAutor(autor) {
        const [rows] = await connection.execute(
            `SELECT l.*,
                (SELECT COUNT(*) FROM exemplar ex WHERE ex.idLivro = l.id AND ex.status = 'disponivel') as exemplares_disponiveis,
                (SELECT COUNT(*) FROM exemplar ex WHERE ex.idLivro = l.id) as total_exemplares
            FROM livro l
            WHERE l.autor LIKE ?
            ORDER BY l.titulo`,
            [`%${autor}%`]
        );
        return rows;
    }

    static async atualizar(id, livro) {
        const { titulo, isbn, autor, editora, anoPublicacao } = livro;
        const [result] = await connection.execute(
            'UPDATE livro SET titulo = ?, isbn = ?, autor = ?, editora = ?, anoPublicacao = ? WHERE id = ?',
            [titulo, isbn, autor, editora, anoPublicacao, id]
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