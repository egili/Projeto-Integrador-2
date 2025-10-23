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
        // Lista livros que possuem ao menos um exemplar disponível
        const [rows] = await connection.execute(`
            SELECT DISTINCT l.*
            FROM livro l
            JOIN exemplar ex ON ex.idLivro = l.id
            WHERE ex.status = 'disponivel'
        `);
        return rows;
    }

    static async listarTodos() {
        const [rows] = await connection.execute('SELECT * FROM livro');
        return rows;
    }

    static async buscarPorTitulo(titulo) {
        const [rows] = await connection.execute(
            'SELECT * FROM livro WHERE titulo LIKE ?',
            [`%${titulo}%`]
        );
        return rows;
    }

    static async buscarPorAutor(autor) {
        const [rows] = await connection.execute(
            'SELECT * FROM livro WHERE autor LIKE ?',
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