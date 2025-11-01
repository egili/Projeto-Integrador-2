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

        try {
            await connection.query(`ALTER TABLE exemplar DROP COLUMN codigo`);
        } catch (error) {
            if (error.code !== 'ER_CANT_DROP_FIELD_OR_KEY') {
                throw error;
            }
        }

        try {
            await connection.query(`ALTER TABLE exemplar DROP COLUMN observacoes`);
        } catch (error) {
            if (error.code !== 'ER_CANT_DROP_FIELD_OR_KEY') {
                throw error;
            }
        }

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

        console.log('Todas as tabelas criadas/verificadas');

        // console.log('Inserindo dados iniciais...');

        // await connection.query(`
        //     INSERT IGNORE INTO aluno (nome, ra) VALUES 
        //     ('Eduardo Fagundes Silva', '25008024'),
        //     ('Lucas Athanasio Bueno de Andrade', '25002731'),
        //     ('Pietra Façanha Bortolatto', '25002436'),
        //     ('Eliseu Gili', '25009281')
        // `);

        // await connection.query(`
        //     INSERT IGNORE INTO livro (titulo, isbn, autor, editora, anoPublicacao, categoria) VALUES 
        //     ('Introdução à Programação', '978-85-12345-01-1', 'João Silva', 'Tecnologia Press', 2023, 'Programação'),
        //     ('Banco de Dados Relacional', '978-85-12345-02-2', 'Maria Santos', 'Data Books', 2022, 'Banco de Dados'),
        //     ('Desenvolvimento Web Moderno', '978-85-12345-03-3', 'Pedro Costa', 'Web Publishing', 2024, 'Desenvolvimento Web'),
        //     ('Algoritmos e Estruturas de Dados', '978-85-12345-04-4', 'Ana Lima', 'Ciência & Tech', 2023, 'Programação'),
        //     ('Engenharia de Software', '978-85-12345-05-5', 'Carlos Mendes', 'Software Publishing', 2022, 'Engenharia de Software')
        // `);

        // await connection.query(`
        //     INSERT IGNORE INTO exemplar (idLivro, status) VALUES 
        //     (1, 'disponivel'),
        //     (1, 'disponivel'),
        //     (1, 'disponivel'),
        //     (2, 'disponivel'),
        //     (2, 'disponivel'),
        //     (2, 'disponivel'),
        //     (3, 'disponivel'),
        //     (3, 'disponivel'),
        //     (3, 'disponivel'),
        //     (4, 'disponivel'),
        //     (4, 'disponivel'),
        //     (4, 'disponivel'),
        //     (5, 'disponivel'),
        //     (5, 'disponivel'),
        //     (5, 'disponivel')
        // `);

        // console.log('Banco de dados inicializado com sucesso!');

        // // Contar registros inseridos
        // const [alunoCount] = await connection.query('SELECT COUNT(*) as count FROM aluno');
        // const [livroCount] = await connection.query('SELECT COUNT(*) as count FROM livro');
        // const [exemplarCount] = await connection.query('SELECT COUNT(*) as count FROM exemplar');

        // console.log('Resumo dos dados inseridos:');
        // console.log(`Alunos: ${alunoCount[0].count}`);
        // console.log(`Livros: ${livroCount[0].count}`);
        // console.log(`Exemplares: ${exemplarCount[0].count}`);

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
