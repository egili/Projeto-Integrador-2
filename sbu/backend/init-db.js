const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        console.log('Conectado ao MySQL');

        await connection.query('CREATE DATABASE IF NOT EXISTS biblioteca');
        console.log('Banco de dados "biblioteca" verificado/criado');

        await connection.query('USE biblioteca');
        console.log('Conectado ao banco de dados "biblioteca"');

        console.log('Criando tabelas...');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS aluno (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                ra VARCHAR(20) UNIQUE NOT NULL
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS livro (
                id INT AUTO_INCREMENT PRIMARY KEY,
                titulo VARCHAR(255) NOT NULL,
                isbn VARCHAR(20) UNIQUE,
                autor VARCHAR(255) NOT NULL,
                editora VARCHAR(255),
                anoPublicacao INT,
                categoria VARCHAR(100)
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS exemplar (
                id INT AUTO_INCREMENT PRIMARY KEY,
                idLivro INT NOT NULL,
                status ENUM('disponivel', 'emprestado') DEFAULT 'disponivel',
                FOREIGN KEY (idLivro) REFERENCES livro(id) ON DELETE CASCADE
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS emprestimo (
                id INT AUTO_INCREMENT PRIMARY KEY,
                idAluno INT NOT NULL,
                idExemplar INT NOT NULL,
                dataEmprestimo DATETIME NOT NULL,
                dataDevolucaoReal DATETIME,
                FOREIGN KEY (idAluno) REFERENCES aluno(id) ON DELETE CASCADE,
                FOREIGN KEY (idExemplar) REFERENCES exemplar(id) ON DELETE CASCADE
            )
        `);

        console.log('Todas as tabelas criadas/verificadas');;

    } catch (error) {
        console.error('Erro ao inicializar o banco de dados:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Conexão com o MySQL fechada.');
        }
    }
}

initDatabase();
